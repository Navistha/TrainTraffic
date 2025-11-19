from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'freights', views.FreightViewSet, basename='freight')

app_name = 'booking'

urlpatterns = [
    path('', include(router.urls)),

    # Stations
    path('stations/', views.StationListView.as_view(), name='station-list'),
    path('stations/<int:pk>/', views.StationDetailView.as_view(), name='station-detail'),

    # Materials
    path('materials/', views.MaterialTypeListView.as_view(), name='material-list'),

    # Route complexity
    path('routes/', views.RouteComplexityListView.as_view(), name='route-list'),
    path('routes/<int:pk>/', views.RouteComplexityDetailView.as_view(), name='route-detail'),

    # Booking API
    path('book/', views.book_freight, name='book-freight'),

    # Statistics
    path('freight-stats/', views.get_freight_statistics),
]
