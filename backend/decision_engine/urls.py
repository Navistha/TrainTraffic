from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'decisions', views.DecisionViewSet, basename='decision')
router.register(r'conflicts', views.ConflictDetectionViewSet, basename='conflict')
router.register(r'analytics', views.DecisionAnalyticsViewSet, basename='analytics')

app_name = 'decision_engine'

urlpatterns = [
    # ViewSet URLs
    path('api/', include(router.urls)),
    
    # Dashboard and status endpoints
    path('api/dashboard/', views.DecisionCenterDashboardView.as_view(), name='dashboard'),
    path('api/engine-status/', views.DecisionEngineStatusView.as_view(), name='engine-status'),
    
    # AI recommendation endpoint
    path('api/ai-recommendation/', views.AIRecommendationView.as_view(), name='ai-recommendation'),
    
    # Manual engine cycle trigger
    path('api/engine-status/run-cycle/', views.DecisionEngineStatusView.as_view(), {'action': 'run_cycle'}, name='run-cycle'),
]