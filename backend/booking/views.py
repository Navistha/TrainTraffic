from rest_framework import generics, status, viewsets, filters
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# from django_filters.rest_framework import DjangoFilterBackend  # TODO: Install django-filter
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.conf import settings
from datetime import datetime, timedelta
import logging
import os
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
from .ml_models.freight_demand_forecast import recursive_forecast

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
    # filterset_fields = ['origin', 'destination', 'complexity_score']  # TODO: Add django-filter
    ordering_fields = ['complexity_score', 'distance_km']
    ordering = ['complexity_score']


class FreightViewSet(viewsets.ModelViewSet):
    """ViewSet for freight operations"""
    queryset = Freight.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['freight_id', 'origin__name', 'destination__name', 'material_type__name']
    # filterset_fields = ['status', 'predicted_delay', 'origin', 'destination', 'material_type']  # TODO: Add django-filter
    ordering_fields = ['created_at', 'scheduled_departure', 'freight_id']
    ordering = ['-created_at']

    @action(detail=False, methods=['get', 'post'], url_path='forecast')
    def forecast(self, request):
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
        return freight_demand_forecast(request._request)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
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
    def track(self, request, pk=None):
        """Track a specific freight by freight_id"""
        try:
            freight = get_object_or_404(Freight, freight_id=pk)
            
            # Increment tracking clicks
            freight.tracking_clicks += 1
            
            # Update status based on tracking clicks (simulate progress)
            if freight.tracking_clicks >= 3 and freight.status not in ['arrived', 'cancelled']:
                freight.status = 'arrived'
            elif freight.tracking_clicks >= 2 and freight.status == 'in_transit':
                freight.status = 'unloading'
            
            freight.save()
            
            serializer = FreightTrackingSerializer(freight)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error tracking freight {pk}: {str(e)}")
            return Response(
                {'error': 'Unable to track freight'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
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


@api_view(['GET'])
def get_freights_by_station(request):
    """Get freights filtered by station (origin or destination)"""
    station = request.GET.get('station')
    
    if not station:
        return Response(
            {'error': 'Please provide ?station=NAME parameter'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        freights = Freight.objects.filter(
            Q(origin__name__icontains=station) | Q(destination__name__icontains=station)
        ).select_related('origin', 'destination', 'material_type')
        
        serializer = FreightListSerializer(freights, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error fetching freights by station {station}: {str(e)}")
        return Response(
            {'error': 'Unable to fetch freights'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_freight_statistics(request):
    """Get freight statistics and dashboard data"""
    try:
        total_freights = Freight.objects.count()
        active_freights = Freight.objects.exclude(status__in=['arrived', 'cancelled']).count()
        delayed_freights = Freight.objects.filter(predicted_delay=True).count()
        arrived_freights = Freight.objects.filter(status='arrived').count()
        
        # Status distribution
        status_counts = {}
        for choice in Freight.STATUS_CHOICES:
            status_counts[choice[1]] = Freight.objects.filter(status=choice[0]).count()
        
        # Recent bookings (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_bookings = Freight.objects.filter(created_at__gte=week_ago).count()
        
        statistics = {
            'total_freights': total_freights,
            'active_freights': active_freights,
            'delayed_freights': delayed_freights,
            'arrived_freights': arrived_freights,
            'recent_bookings': recent_bookings,
            'status_distribution': status_counts,
            'delay_rate': round((delayed_freights / total_freights * 100) if total_freights > 0 else 0, 2)
        }
        
        return Response(statistics)
        
    except Exception as e:
        logger.error(f"Error fetching freight statistics: {str(e)}")
        return Response(
            {'error': 'Unable to fetch statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"]) 
def freight_demand_forecast(request):
    """
    Generate a goods + location-wise forecast of wagons required for the next N days.

    Request body (optional fields):
    - horizon_days: int (default 30)
    - locations: [str]
    - goods_types: [str]
    - save_csv: bool (default False) => writes to backend/datasets/forecasts/freight_demand_forecast_next_30_days.csv

    Returns JSON list of {date, location, goods_type, predicted_wagons}.

    Example JSON payloads:
    1) Minimal (defaults; 30-day horizon, no filters, no CSV saved)
       {}

    2) Save CSV too (writes to backend/datasets/forecasts/freight_demand_forecast_next_30_days.csv)
       {
         "save_csv": true
       }

    3) Filter by locations and goods, custom horizon
       {
         "horizon_days": 30,
         "locations": ["Delhi", "Kanpur"],
         "goods_types": ["coal", "food"],
         "save_csv": true
       }

    Accepted values:
    - locations: ["Delhi", "Kanpur", "Itarsi", "Mughalsarai", "Prayagraj"]
    - goods_types: ["coal", "food", "automobile", "oil", "electronics"]
    """
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
        forecasts_dir = os.path.join(datasets_dir, "forecasts")
        os.makedirs(forecasts_dir, exist_ok=True)
        out_csv = os.path.join(forecasts_dir, "freight_demand_forecast_next_30_days.csv")

        model_path = os.path.join(settings.BASE_DIR, "booking", "ml_models", "freight_demand_model.joblib")
        if not os.path.exists(model_path):
            return Response({"error": "Model not found. Train it first."}, status=status.HTTP_400_BAD_REQUEST)
        if not os.path.exists(data_csv):
            return Response({"error": "Data not found. Generate data first."}, status=status.HTTP_400_BAD_REQUEST)

# Simple in-process cache to avoid reloading the large model on every request
        global _FREIGHT_DEMAND_ARTIFACT
        try:
            _FREIGHT_DEMAND_ARTIFACT
        except NameError:  # first use
            _FREIGHT_DEMAND_ARTIFACT = None

        if _FREIGHT_DEMAND_ARTIFACT is None:
            _FREIGHT_DEMAND_ARTIFACT = joblib.load(model_path)
        artifact = _FREIGHT_DEMAND_ARTIFACT
        model = artifact["model"]
        feature_cols = artifact["feature_cols"]

        hist = pd.read_csv(data_csv, parse_dates=["date"])  # date, location, goods_type, wagons_required

        # Optional filtering of history to requested locations/goods
        if locations:
            hist = hist[hist["location"].isin(locations)]
        if goods_types:
            hist = hist[hist["goods_type"].isin(goods_types)]

        if hist.empty:
            return Response({"error": "No historical data for given filters."}, status=status.HTTP_400_BAD_REQUEST)

        preds = recursive_forecast(model, feature_cols, hist, horizon_days=horizon)
        preds = preds.sort_values(["location", "goods_type", "date"]).reset_index(drop=True)

        saved_path = None
        if save_csv:
            preds.to_csv(out_csv, index=False)
            saved_path = out_csv

        resp = {
            "results": preds.to_dict(orient="records"),
            "saved_csv_path": saved_path,
        }
        return Response(resp)

    except Exception as e:
        logger.exception("Error generating freight demand forecast")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
