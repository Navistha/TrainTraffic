from rest_framework import serializers
from .models import Station, MaterialType, RouteComplexity, Freight
from datetime import datetime


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['id', 'name', 'city', 'state', 'latitude', 'longitude', 'is_active']
        read_only_fields = ['id']


class MaterialTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialType
        fields = ['id', 'name', 'description', 'unit', 'is_hazardous']
        read_only_fields = ['id']


class RouteComplexitySerializer(serializers.ModelSerializer):
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    
    class Meta:
        model = RouteComplexity
        fields = [
            'id', 'origin', 'destination', 'origin_name', 'destination_name',
            'complexity_score', 'distance_km', 'estimated_hours'
        ]
        read_only_fields = ['id']


class FreightListSerializer(serializers.ModelSerializer):
    """Serializer for listing freights with minimal information"""
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    material_name = serializers.CharField(source='material_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Freight
        fields = [
            'freight_id', 'origin_name', 'destination_name', 'material_name',
            'quantity', 'status', 'status_display', 'scheduled_departure',
            'scheduled_arrival', 'predicted_delay', 'created_at'
        ]


class FreightDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed freight information"""
    origin = StationSerializer(read_only=True)
    destination = StationSerializer(read_only=True)
    material_type = MaterialTypeSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_delayed = serializers.ReadOnlyField()
    
    class Meta:
        model = Freight
        fields = [
            'freight_id', 'origin', 'destination', 'material_type', 'quantity',
            'status', 'status_display', 'scheduled_departure', 'scheduled_arrival',
            'actual_departure', 'actual_arrival', 'predicted_delay', 
            'delay_probability', 'route_complexity', 'tracking_clicks', 
            'is_delayed', 'created_at', 'updated_at'
        ]


class FreightBookingSerializer(serializers.Serializer):
    """Serializer for booking a new freight"""
    origin = serializers.CharField(max_length=100)
    destination = serializers.CharField(max_length=100)
    material_type = serializers.CharField(max_length=100)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)
    scheduled_date = serializers.DateField()
    
    def validate(self, data):
        """Validate booking data"""
        origin = data.get('origin')
        destination = data.get('destination')
        
        if origin == destination:
            raise serializers.ValidationError("Origin and destination cannot be the same.")
        
        # Validate that stations exist
        try:
            origin_station = Station.objects.get(name__iexact=origin, is_active=True)
            destination_station = Station.objects.get(name__iexact=destination, is_active=True)
        except Station.DoesNotExist:
            raise serializers.ValidationError("One or both stations are invalid or inactive.")
        
        # Validate material type exists
        try:
            material = MaterialType.objects.get(name__iexact=data.get('material_type'))
        except MaterialType.DoesNotExist:
            raise serializers.ValidationError("Invalid material type.")
        
        # Validate date is not in the past
        scheduled_date = data.get('scheduled_date')
        if scheduled_date < datetime.now().date():
            raise serializers.ValidationError("Scheduled date cannot be in the past.")
        
        data['origin_station'] = origin_station
        data['destination_station'] = destination_station
        data['material'] = material
        
        return data


class FreightBookingResponseSerializer(serializers.Serializer):
    """Serializer for booking response"""
    freight_id = serializers.CharField()
    message = serializers.CharField()
    scheduled_departure = serializers.DateTimeField()
    estimated_arrival = serializers.DateTimeField()
    predicted_delay = serializers.BooleanField()
    delay_probability = serializers.DecimalField(max_digits=5, decimal_places=4, allow_null=True)


class FreightTrackingSerializer(serializers.ModelSerializer):
    """Serializer for freight tracking"""
    origin_name = serializers.CharField(source='origin.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    material_name = serializers.CharField(source='material_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_delayed = serializers.ReadOnlyField()
    
    class Meta:
        model = Freight
        fields = [
            'freight_id', 'origin_name', 'destination_name', 'material_name',
            'quantity', 'status', 'status_display', 'scheduled_departure',
            'scheduled_arrival', 'actual_departure', 'actual_arrival',
            'predicted_delay', 'is_delayed', 'tracking_clicks'
        ]


class FreightUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating freight status"""
    class Meta:
        model = Freight
        fields = ['status', 'actual_departure', 'actual_arrival']
        
    def validate_status(self, value):
        """Validate status transitions"""
        instance = getattr(self, 'instance', None)
        if instance:
            current_status = instance.status
            valid_transitions = {
                'free': ['booked', 'cancelled'],
                'booked': ['loading', 'cancelled'],
                'loading': ['in_transit'],
                'in_transit': ['unloading', 'delayed'],
                'unloading': ['arrived', 'reloading'],
                'reloading': ['in_transit'],
                'delayed': ['in_transit', 'unloading', 'arrived'],
                'arrived': [],  # Terminal state
                'cancelled': []  # Terminal state
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{current_status}' to '{value}'"
                )
        
        return value


class FreightDemandForecastRequestSerializer(serializers.Serializer):
    """Optional filters and settings for freight demand forecast."""
    horizon_days = serializers.IntegerField(min_value=1, max_value=60, required=False, default=30)
    locations = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    goods_types = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    save_csv = serializers.BooleanField(required=False, default=False)


class FreightDemandForecastItemSerializer(serializers.Serializer):
    date = serializers.DateField()
    location = serializers.CharField()
    goods_type = serializers.CharField()
    predicted_wagons = serializers.IntegerField()


class FreightDemandForecastResponseSerializer(serializers.Serializer):
    results = FreightDemandForecastItemSerializer(many=True)
    saved_csv_path = serializers.CharField(allow_null=True, required=False)
