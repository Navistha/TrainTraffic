from rest_framework import generics, status, viewsets, filters
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q
from django.conf import settings
from datetime import datetime, timedelta
import logging
import os
import time
import joblib
import pandas as pd

from .models import Station, MaterialType, RouteComplexity, Freight
from .serializers import (
    StationSerializer, MaterialTypeSerializer, RouteComplexitySerializer,
    FreightListSerializer, FreightDetailSerializer, FreightBookingSerializer,
    FreightBookingResponseSerializer, FreightTrackingSerializer, FreightUpdateSerializer,
    FreightDemandForecastRequestSerializer, FreightDemandForecastResponseSerializer,
)
from .ml_utils import predict_freight_delay
from booking.ml_models.freight_demand_forecast import recursive_forecast

# Custom renderer that keeps the browsable page but hides HTML forms
class NoFormBrowsableAPIRenderer(BrowsableAPIRenderer):
    """Custom renderer that keeps the browsable API page but hides HTML forms."""
    def get_rendered_html_form(self, data, view, method, request):
        """Override to return None, hiding the HTML form."""
        return None

logger = logging.getLogger(__name__)


class StationListView(generics.ListCreateAPIView):
    """List all stations or create a new station"""
    queryset = Station.objects.filter(is_active=True)
    serializer_class = StationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'city', 'state']
    ordering_fields = ['name', 'city', 'state']
    ordering = ['name']


class StationDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a specific station"""
    queryset = Station.objects.all()
    serializer_class = StationSerializer


class MaterialTypeListView(generics.ListCreateAPIView):
    """List all material types or create a new material type"""
    queryset = MaterialType.objects.all()
    serializer_class = MaterialTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']


class RouteComplexityListView(generics.ListCreateAPIView):
    """List all route complexities or create a new route complexity"""
    queryset = RouteComplexity.objects.all()
    serializer_class = RouteComplexitySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['complexity_score', 'distance_km']
    ordering = ['complexity_score']

class RouteComplexityDetailView(generics.RetrieveAPIView):
    queryset = RouteComplexity.objects.all()
    serializer_class = RouteComplexitySerializer
    permission_classes = [IsAuthenticated]

# lookup by freight_id string (legacy route)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def freight_by_freight_id(request, freight_id):
    """
    GET /api/booking/freights/id/<freight_id>/
    Return freight by its freight_id string (Fxxxxx).
    """
    from .models import Freight
    try:
        freight = Freight.objects.get(freight_id=freight_id)
    except Freight.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = FreightDetailSerializer(freight, context={'request': request})
    return Response(serializer.data)


# freights by station (query param station=name or id)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_freights_by_station(request):
    """
    /api/booking/freights/station/?station=Delhi   OR ?station=1
    Accepts station name or ID. Returns list of freights where origin or destination matches.
    """
    from .models import Freight, Station
    q = request.query_params.get('station')
    if not q:
        return Response({"detail": "Please provide ?station=<name_or_id>"}, status=status.HTTP_400_BAD_REQUEST)

    # try integer id first
    freights_qs = Freight.objects.none()
    if q.isdigit():
        freights_qs = Freight.objects.filter(Q(origin__id=int(q)) | Q(destination__id=int(q)))
    else:
        freights_qs = Freight.objects.filter(Q(origin__name__iexact=q) | Q(destination__name__iexact=q))

    serializer = FreightListSerializer(freights_qs, many=True, context={'request': request})
    if not freights_qs.exists():
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.data)


# freight statistics
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_freight_statistics(request):
    """
    Basic statistics: counts by status, avg delay_prob, total quantity per material, etc.
    """
    from .models import Freight
    stats = {}

    total = Freight.objects.count()
    stats['total_freights'] = total
    stats['by_status'] = list(Freight.objects.values('status').annotate(count=Count('id')))

    # average delay_probability (nullable)
    from django.db.models import Avg
    avg_delay = Freight.objects.aggregate(avg_delay_probability=Avg('delay_probability'))
    stats['avg_delay_probability'] = avg_delay.get('avg_delay_probability')

    # example: total quantity per material_type
    from django.db.models import Sum
    material_totals = Freight.objects.values('material_type__name').annotate(total_quantity=Sum('quantity'))
    stats['quantity_by_material'] = list(material_totals)

    return Response(stats)


@api_view(["POST"])
@permission_classes([AllowAny])
def freight_demand_forecast(request):
    serializer = FreightDemandForecastRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    params = serializer.validated_data
    horizon = params.get("horizon_days", 30)
    locations = params.get("locations") or []
    goods_types = params.get("goods_types") or []
    save_csv = params.get("save_csv", False)

    try:
        datasets_dir = os.path.join(settings.BASE_DIR, "datasets")
        data_csv = os.path.join(datasets_dir, "freight_demand_simulated.csv")

        model_path = os.path.join(settings.BASE_DIR, "booking", "ml_models", "freight_demand_forecast.joblib")
        if not os.path.exists(model_path):
            return Response({"error": "Model not found."}, status=status.HTTP_400_BAD_REQUEST)
        if not os.path.exists(data_csv):
            return Response({"error": "Data not found."}, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(freight_demand_forecast, '_freight_demand_artifact'):
            freight_demand_forecast._freight_demand_artifact = joblib.load(model_path)

        artifact = freight_demand_forecast._freight_demand_artifact
        
        # Handle both old (pipeline) and new (artifact dict) formats
        if isinstance(artifact, dict):
            model = artifact.get("model")
            feature_cols = artifact.get("feature_cols")
            if not model or not feature_cols:
                return Response(
                    {"error": "Model artifact is malformed: missing 'model' or 'feature_cols'."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Fallback for old format (direct pipeline)
            model = artifact
            feature_cols = ["location", "goods_type", "day_of_week", "horizon"]

        hist = pd.read_csv(data_csv, parse_dates=["date"])

        if locations:
            hist = hist[hist["location"].isin(locations)]
        if goods_types:
            hist = hist[hist["goods_type"].isin(goods_types)]

        if hist.empty:
            return Response({"error": "No historical data for given filters."}, status=status.HTTP_400_BAD_REQUEST)

        preds = recursive_forecast(model, feature_cols, hist, horizon_days=horizon)
        preds = preds.sort_values(["location", "goods_type", "date"]).reset_index(drop=True)

        # --------------------------
        # SAVE FORECAST INTO /datasets/forecasts/
        # --------------------------
        saved_path = None
        if save_csv:
            forecasts_dir = os.path.join(settings.BASE_DIR, "datasets", "forecasts")
            os.makedirs(forecasts_dir, exist_ok=True)

            timestamp = int(time.time())
            file_name = f"freight_demand_forecast_{timestamp}.csv"
            out_csv = os.path.join(forecasts_dir, file_name)

            preds.to_csv(out_csv, index=False)
            saved_path = out_csv

        return Response({
            "forecast": preds.to_dict(orient="records"),
            "saved_csv_path": saved_path
        })

    except Exception as e:
        logger.exception("Forecast generation error")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FreightViewSet(viewsets.ModelViewSet):
    """ViewSet for freight operations"""
    queryset = Freight.objects.all()
    lookup_field = 'freight_id'
    lookup_url_kwarg = 'freight_id'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['freight_id', 'origin__name', 'destination__name', 'material_type__name']
    ordering_fields = ['created_at', 'scheduled_departure', 'freight_id']
    ordering = ['-created_at']

    @action(
        detail=False,
        methods=['get','post'],
        url_path='forecast',
        renderer_classes=[JSONRenderer, NoFormBrowsableAPIRenderer],
        serializer_class=FreightDemandForecastRequestSerializer,
        permission_classes=[AllowAny],
    )
    def forecast(self, request, *args, **kwargs):
        """Freight demand forecast API mounted under the router.
        - POST /api/booking/freights/forecast/ with JSON body to run forecast
        - GET  /api/booking/freights/forecast/ returns usage examples and accepted values
        """
        if request.method.lower() == 'get':
            examples = {
                "minimal": {},
                "save_csv": {"save_csv": True},
                "filtered": {
                    "horizon_days": 30,
                    "locations": ["Delhi", "Kanpur"],
                    "goods_types": ["coal", "food"],
                    "save_csv": True
                },
                "accepted_values": {
                    "locations": ["Delhi", "Kanpur", "Itarsi", "Mughalsarai", "Prayagraj"],
                    "goods_types": ["coal", "food", "automobile", "oil", "electronics"]
                }
            }
            return Response(examples)
        # Call the API-view function with the underlying Django HttpRequest to avoid double-wrapping
        return freight_demand_forecast.__wrapped__(request._request)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if getattr(self, 'action', None) == 'forecast':
            return FreightDemandForecastRequestSerializer
        if self.action == 'list':
            return FreightListSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return FreightDetailSerializer
        return FreightDetailSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Freight.objects.select_related('origin', 'destination', 'material_type')
        
        # Filter by station (origin or destination)
        station = self.request.query_params.get('station', None)
        if station:
            queryset = queryset.filter(
                Q(origin__name__icontains=station) | Q(destination__name__icontains=station)
            )
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(scheduled_departure__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(scheduled_departure__date__lte=end_date)
            except ValueError:
                pass
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def track(self, request, freight_id=None):
        """Track a specific freight by freight_id"""
        try:
            # use self.get_object() so lookup_field is respected and permission checks apply
            freight = self.get_object()
            
            # Increment tracking clicks
            freight.tracking_clicks += 1
            
            # Update status based on tracking clicks (simulate progress)
            if freight.tracking_clicks >= 3 and freight.status not in ['arrived', 'cancelled']:
                freight.status = 'arrived'
            elif freight.tracking_clicks >= 2 and freight.status == 'in_transit':
                freight.status = 'unloading'
            
            freight.save(update_fields=['tracking_clicks','status'])
            
            serializer = FreightTrackingSerializer(freight, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error tracking freight {freight_id}: {str(e)}")
            return Response(
                {'error': 'Unable to track freight'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, freight_id=None):
        """Update freight status"""
        freight = self.get_object()
        serializer = FreightUpdateSerializer(freight, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(FreightDetailSerializer(freight).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def book_freight(request):
    """Book a new freight"""
    serializer = FreightBookingSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validated_data = serializer.validated_data
        
        # Get stations and material from validated data
        origin_station = validated_data['origin_station']
        destination_station = validated_data['destination_station']
        material = validated_data['material']
        quantity = float(validated_data['quantity'])
        scheduled_date = validated_data['scheduled_date']
        
        # Calculate departure time (assuming booking time + some buffer)
        scheduled_departure = datetime.combine(scheduled_date, datetime.min.time().replace(hour=8))
        scheduled_departure = timezone.make_aware(scheduled_departure)
        
        # Predict delay using ML
        prediction_results = predict_freight_delay(
            quantity, origin_station.name, destination_station.name
        )
        
        # Calculate estimated arrival time
        travel_hours = prediction_results['estimated_travel_hours']
        estimated_arrival = scheduled_departure + timedelta(hours=travel_hours)
        
        # Create freight booking
        freight = Freight.objects.create(
            origin=origin_station,
            destination=destination_station,
            material_type=material,
            quantity=quantity,
            scheduled_departure=scheduled_departure,
            scheduled_arrival=estimated_arrival,
            predicted_delay=prediction_results['predicted_delay'],
            delay_probability=prediction_results['delay_probability'],
            route_complexity=prediction_results['route_complexity'],
            status='booked',
            created_by=request.user if request.user.is_authenticated else None
        )
        
        response_data = {
            'freight_id': freight.freight_id,
            'message': 'Booking successful',
            'scheduled_departure': freight.scheduled_departure,
            'estimated_arrival': freight.scheduled_arrival,
            'predicted_delay': freight.predicted_delay,
            'delay_probability': freight.delay_probability
        }
        
        response_serializer = FreightBookingResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error booking freight: {str(e)}")
        return Response(
            {'error': 'Failed to book freight. Please try again.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


