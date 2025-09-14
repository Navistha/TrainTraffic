from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import timedelta, datetime
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Decision, AIRecommendation, DecisionAction, DecisionAnalytics, ConflictDetection
from .serializers import (
    DecisionListSerializer, DecisionDetailSerializer, DecisionActionCreateSerializer,
    ConflictDetectionSerializer, DecisionAnalyticsSerializer, DecisionSummarySerializer,
    DecisionEngineStatusSerializer
)
from .ai_engine import decision_engine


class DecisionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing decisions
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Decision.objects.select_related('ai_recommendation', 'assigned_controller').prefetch_related('actions')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority', None)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        # Filter by decision type
        decision_type = self.request.query_params.get('decision_type', None)
        if decision_type:
            queryset = queryset.filter(decision_type=decision_type)
        
        # Filter by trains involved
        train_filter = self.request.query_params.get('train_id', None)
        if train_filter:
            queryset = queryset.filter(trains_involved__contains=[train_filter])
        
        # Filter pending decisions only
        pending_only = self.request.query_params.get('pending_only', 'false').lower() == 'true'
        if pending_only:
            queryset = queryset.filter(status='pending', deadline__gte=timezone.now())
        
        return queryset.order_by('-priority', '-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DecisionListSerializer
        return DecisionDetailSerializer
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending decisions"""
        pending_decisions = self.get_queryset().filter(
            status='pending',
            deadline__gte=timezone.now()
        )
        
        serializer = DecisionListSerializer(pending_decisions, many=True)
        return Response({
            'count': len(serializer.data),
            'decisions': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent decisions (last 24 hours)"""
        recent_decisions = self.get_queryset().filter(
            created_at__gte=timezone.now() - timedelta(days=1)
        )
        
        serializer = DecisionListSerializer(recent_decisions, many=True)
        return Response({
            'count': len(serializer.data),
            'decisions': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def accept_recommendation(self, request, pk=None):
        """Accept AI recommendation for a decision"""
        decision = self.get_object()
        
        if decision.status != 'pending':
            return Response(
                {'error': 'Decision is no longer pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_data = {
            'decision': decision.id,
            'action_type': 'accept'
        }
        
        serializer = DecisionActionCreateSerializer(data=action_data, context={'request': request})
        if serializer.is_valid():
            action = serializer.save()
            return Response({
                'message': 'Recommendation accepted',
                'action_id': action.id,
                'decision_status': decision.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def modify_recommendation(self, request, pk=None):
        """Modify AI recommendation for a decision"""
        decision = self.get_object()
        
        if decision.status != 'pending':
            return Response(
                {'error': 'Decision is no longer pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        modified_recommendation = request.data.get('modified_recommendation', '')
        custom_parameters = request.data.get('custom_parameters', {})
        
        if not modified_recommendation:
            return Response(
                {'error': 'Modified recommendation text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_data = {
            'decision': decision.id,
            'action_type': 'modify',
            'modified_recommendation': modified_recommendation,
            'custom_parameters': custom_parameters
        }
        
        serializer = DecisionActionCreateSerializer(data=action_data, context={'request': request})
        if serializer.is_valid():
            action = serializer.save()
            return Response({
                'message': 'Recommendation modified',
                'action_id': action.id,
                'decision_status': decision.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def override_recommendation(self, request, pk=None):
        """Override AI recommendation for a decision"""
        decision = self.get_object()
        
        if decision.status != 'pending':
            return Response(
                {'error': 'Decision is no longer pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        override_reason = request.data.get('override_reason', '')
        
        if not override_reason:
            return Response(
                {'error': 'Override reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_data = {
            'decision': decision.id,
            'action_type': 'override',
            'override_reason': override_reason
        }
        
        serializer = DecisionActionCreateSerializer(data=action_data, context={'request': request})
        if serializer.is_valid():
            action = serializer.save()
            return Response({
                'message': 'Recommendation overridden',
                'action_id': action.id,
                'decision_status': decision.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConflictDetectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing conflict detections
    """
    queryset = ConflictDetection.objects.all()
    serializer_class = ConflictDetectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by resolution status
        resolved = self.request.query_params.get('resolved', None)
        if resolved is not None:
            is_resolved = resolved.lower() == 'true'
            queryset = queryset.filter(is_resolved=is_resolved)
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-severity', 'conflict_time')
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active (unresolved) conflicts"""
        active_conflicts = self.get_queryset().filter(is_resolved=False)
        serializer = self.get_serializer(active_conflicts, many=True)
        return Response({
            'count': len(serializer.data),
            'conflicts': serializer.data
        })


class DecisionAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for decision analytics
    """
    queryset = DecisionAnalytics.objects.select_related('decision')
    serializer_class = DecisionAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')


class DecisionCenterDashboardView(APIView):
    """
    API view for decision center dashboard data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Basic counts
        total_pending = Decision.objects.filter(status='pending').count()
        high_priority_pending = Decision.objects.filter(status='pending', priority='high').count()
        medium_priority_pending = Decision.objects.filter(status='pending', priority='medium').count()
        low_priority_pending = Decision.objects.filter(status='pending', priority='low').count()
        
        # Decisions made today
        decisions_today = Decision.objects.filter(decided_at__date=today).count()
        
        # Active conflicts
        active_conflicts = ConflictDetection.objects.filter(is_resolved=False).count()
        
        # Analytics
        recent_analytics = DecisionAnalytics.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        )
        
        recommendations_accuracy = recent_analytics.aggregate(
            avg_accuracy=Avg('recommendation_accuracy')
        )['avg_accuracy'] or 0.0
        
        avg_decision_time = recent_analytics.aggregate(
            avg_time=Avg('decision_time_seconds')
        )['avg_time'] or 0.0
        avg_decision_time_minutes = avg_decision_time / 60 if avg_decision_time else 0.0
        
        summary_data = {
            'total_pending': total_pending,
            'high_priority_pending': high_priority_pending,
            'medium_priority_pending': medium_priority_pending,
            'low_priority_pending': low_priority_pending,
            'decisions_today': decisions_today,
            'recommendations_accuracy': round(recommendations_accuracy, 1),
            'avg_decision_time_minutes': round(avg_decision_time_minutes, 1),
            'active_conflicts': active_conflicts
        }
        
        serializer = DecisionSummarySerializer(summary_data)
        return Response(serializer.data)


class DecisionEngineStatusView(APIView):
    """
    API view for decision engine status
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Get engine status
        decisions_processed_today = Decision.objects.filter(
            ai_recommendation__generated_at__date=today
        ).count()
        
        conflicts_detected_today = ConflictDetection.objects.filter(
            detected_at__date=today
        ).count()
        
        # Check if ML models are loaded
        ml_models_loaded = hasattr(decision_engine.analyzer, 'models_loaded') and decision_engine.analyzer.models_loaded
        
        status_data = {
            'status': 'active',
            'last_cycle_run': timezone.now() - timedelta(minutes=5),  # Simulated
            'decisions_processed_today': decisions_processed_today,
            'conflicts_detected_today': conflicts_detected_today,
            'ai_engine_active': True,
            'ml_models_loaded': ml_models_loaded
        }
        
        serializer = DecisionEngineStatusSerializer(status_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def run_cycle(self, request):
        """Manually trigger decision engine cycle"""
        try:
            summary = decision_engine.run_decision_cycle()
            return Response({
                'message': 'Decision cycle completed successfully',
                'summary': summary
            })
        except Exception as e:
            return Response({
                'error': f'Decision cycle failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIRecommendationView(APIView):
    """
    Generate AI recommendation for a specific scenario
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate recommendation for custom scenario"""
        scenario_type = request.data.get('scenario_type')
        trains_involved = request.data.get('trains_involved', [])
        context_data = request.data.get('context_data', {})
        
        if not scenario_type:
            return Response(
                {'error': 'scenario_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create temporary decision for recommendation
        temp_decision = Decision(
            title=f"Custom {scenario_type} Scenario",
            description=f"Custom scenario analysis for {scenario_type}",
            decision_type=scenario_type,
            trains_involved=trains_involved,
            context_data=context_data
        )
        
        try:
            # Generate recommendation without saving decision
            recommendation = decision_engine.recommender.generate_recommendation(temp_decision)
            
            return Response({
                'recommendation_text': recommendation.recommendation_text,
                'confidence_score': recommendation.confidence_score,
                'reasoning_points': recommendation.reasoning_points,
                'expected_impact': recommendation.get_impact_summary(),
                'model_version': recommendation.model_version
            })
        
        except Exception as e:
            return Response({
                'error': f'Failed to generate recommendation: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)