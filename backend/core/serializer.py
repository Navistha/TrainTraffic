from rest_framework import serializers
from .models import RealTimeDelay, Train, Station, Track, RailwayWorker, Employee
import logging

logger = logging.getLogger(__name__)


class EmployeeSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(
        source='get_role_display', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'govt_id', 'name', 'role', 'role_display',
            'is_active', 'is_staff', 'last_login'
        ]
        read_only_fields = ['id', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True},
        }


class TrainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Train
        fields = "__all__"


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = "__all__"


class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = "__all__"


class RailwayWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RailwayWorker
        fields = "__all__"


class RealTimeDelaySerializer(serializers.ModelSerializer):
    class Meta:
        model = RealTimeDelay
        fields = "__all__"


class EmployeeLoginSerializer(serializers.Serializer):
    govt_id = serializers.CharField(help_text="Employee Work ID")
    role = serializers.CharField(help_text="Employee role")
    name = serializers.CharField(
        help_text="Full name of employee", required=False)

    def validate(self, data):
        govt_id = data.get("govt_id")
        role = data.get("role")

        # Normalize role input: accept hyphenated or snake_case, lowercase
        def normalize_role_input(r):
            if not r:
                return r
            return r.replace('-', '_').replace(' ', '_').lower()

        role_norm = normalize_role_input(role)

        try:
            user = Employee.objects.get(govt_id=govt_id)
        except Employee.DoesNotExist:
            # If an Employee doesn't exist, try to find a RailwayWorker and
            # create a corresponding Employee so JWT tokens can be issued.
            try:
                rw = RailwayWorker.objects.get(govt_id=govt_id)
            except RailwayWorker.DoesNotExist:
                raise serializers.ValidationError(
                    {"govt_id": ["Invalid work ID"]})

            # Map RailwayWorker.role (which may be free text or different format)
            # to one of Employee.ROLE_CHOICES keys if possible. Try simple
            # normalization first, otherwise fallback to exact mapping by name.
            possible_role = normalize_role_input(rw.role)
            valid_roles = {k for k, _ in Employee.ROLE_CHOICES}
            if possible_role in valid_roles:
                chosen_role = possible_role
            else:
                # Try matching by display label (case-insensitive)
                label_map = {label.lower(): key for key,
                             label in Employee.ROLE_CHOICES}
                chosen_role = label_map.get(rw.role.lower())
                if not chosen_role:
                    # as a last resort, set to freight_operator to allow access but mark inactive
                    chosen_role = 'freight_operator'

            # Create Employee from RailwayWorker data. Use manager.create_user to
            # properly set password handling. We'll set an unusable password by default.
            user = Employee.objects.create_user(
                govt_id=rw.govt_id,
                password=None,
                name=rw.name,
                role=chosen_role,
            )

        # Log diagnostic info to help debug mismatches
        try:
            logger.debug(
                "EmployeeLogin check: govt_id=%s incoming_role=%s role_norm=%s user_role=%s user_display=%s",
                govt_id,
                role,
                role_norm,
                getattr(user, 'role', None),
                getattr(user, 'get_role_display', lambda: None)(
                ) if hasattr(user, 'get_role_display') else None,
            )
        except Exception:
            # never raise from logging
            pass

        # Validate role: compare normalized forms so incoming values like
        # 'freight_operator', 'freight-operator', or 'Freight Operator' match
        def normalize_for_compare(s):
            if not s:
                return s
            return s.replace('-', '_').replace(' ', '_').lower()

        user_role_norm = normalize_for_compare(user.role)
        # also allow matching by display string
        user_display_norm = normalize_for_compare(user.get_role_display())

        if role_norm and role_norm != user_role_norm and role_norm != user_display_norm:
            raise serializers.ValidationError({"role": ["Invalid role"]})

        # Optional name check if provided (case-insensitive, strip whitespace)
        name = data.get("name")
        if name:
            if user.name.strip().lower() != name.strip().lower():
                raise serializers.ValidationError(
                    {"name": ["Name does not match"]})

        if not user.is_active:
            raise serializers.ValidationError(
                {"govt_id": ["Account is inactive"]})

        data["user"] = user
        return data
