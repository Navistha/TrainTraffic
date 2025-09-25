from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'freights', views.FreightViewSet, basename='freight')

app_name = 'booking'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Stations
    path('stations/', views.StationListView.as_view(), name='station-list'),
    path('stations/<int:pk>/', views.StationDetailView.as_view(), name='station-detail'),
    
    # Material Types
    path('materials/', views.MaterialTypeListView.as_view(), name='material-list'),
    
    # Route Complexity
    path('routes/', views.RouteComplexityListView.as_view(), name='route-list'),
    
    # Freight specific endpoints
    path('book/', views.book_freight, name='book-freight'),
    path('freights/station/', views.get_freights_by_station, name='freights-by-station'),
    path('freights/statistics/', views.get_freight_statistics, name='freight-statistics'),

    # Freight demand forecast (ML)
    path('freights/forecast/', views.freight_demand_forecast, name='freight-demand-forecast'),
    
    # Legacy endpoint support (from original Flask app)
    path('track/<str:freight_id>/', views.FreightViewSet.as_view({'get': 'track'}), name='track-freight'),
]
