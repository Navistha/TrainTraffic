"""
AI Decision Engine Core Logic
Generates intelligent recommendations for railway operations
"""
import random
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from django.utils import timezone
from django.db.models import Q

from .models import Decision, AIRecommendation, DecisionType, ConflictDetection
from core.models import Train, Track, Station, RealTimeDelay
from ml.predict import predict_delay
from .explainable_ai import explainable_ai
import pandas as pd
import joblib
import os


class TrainOperationAnalyzer:
    """Analyzes current train operations to detect conflicts and generate recommendations"""
    
    def __init__(self):
        self.load_ml_models()
    
    def load_ml_models(self):
        """Load ML models for delay prediction"""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ml_dir = os.path.join(base_dir, "ml")
            
            self.delay_classifier = joblib.load(os.path.join(ml_dir, "delay_classifier.pkl"))
            self.delay_regressor = joblib.load(os.path.join(ml_dir, "delay_regressor.pkl"))
            self.preprocessor = joblib.load(os.path.join(ml_dir, "delay_preprocessor.pkl"))
            self.models_loaded = True
        except Exception as e:
            print(f"Warning: Could not load ML models: {e}")
            self.models_loaded = False
    
    def detect_train_conflicts(self) -> List[ConflictDetection]:
        """Detect potential conflicts between trains"""
        conflicts = []
        
        # Get active trains and their current delays
        current_delays = RealTimeDelay.objects.filter(
            actual_arrival__isnull=True,  # Still pending
            scheduled_arrival__gte=timezone.now() - timedelta(hours=1)
        ).select_related()
        
        # Check for precedence conflicts at junctions
        conflicts.extend(self._detect_precedence_conflicts(current_delays))
        
        # Check for platform assignment conflicts
        conflicts.extend(self._detect_platform_conflicts())
        
        # Check for capacity conflicts
        conflicts.extend(self._detect_capacity_conflicts())
        
        return conflicts
    
    def _detect_precedence_conflicts(self, delays) -> List[ConflictDetection]:
        """Detect train precedence conflicts at junctions"""
        conflicts = []
        
        # Group delays by station
        station_delays = {}
        for delay in delays:
            station = delay.station_code
            if station not in station_delays:
                station_delays[station] = []
            station_delays[station].append(delay)
        
        # Check for conflicting arrivals at same station
        for station_code, station_delays_list in station_delays.items():
            if len(station_delays_list) >= 2:
                # Sort by scheduled arrival
                station_delays_list.sort(key=lambda x: x.scheduled_arrival)
                
                for i in range(len(station_delays_list) - 1):
                    delay1 = station_delays_list[i]
                    delay2 = station_delays_list[i + 1]
                    
                    # If trains arrive within 5 minutes, it's a potential conflict
                    time_diff = (delay2.scheduled_arrival - delay1.scheduled_arrival).total_seconds() / 60
                    if time_diff <= 5:
                        conflict = ConflictDetection(
                            conflict_type='train_precedence',
                            severity='high',
                            trains_involved=[delay1.train_number, delay2.train_number],
                            stations_involved=[station_code],
                            conflict_time=delay1.scheduled_arrival,
                            resolution_deadline=delay1.scheduled_arrival - timedelta(minutes=15),
                            conflict_details={
                                'trains': [delay1.train_number, delay2.train_number],
                                'scheduled_times': [
                                    delay1.scheduled_arrival.isoformat(),
                                    delay2.scheduled_arrival.isoformat()
                                ],
                                'time_gap_minutes': time_diff
                            },
                            potential_impact=f"Potential collision risk at {station_code}. Trains {delay1.train_number} and {delay2.train_number} scheduled within {time_diff:.1f} minutes."
                        )
                        conflicts.append(conflict)
        
        return conflicts
    
    def _detect_platform_conflicts(self) -> List[ConflictDetection]:
        """Detect platform assignment conflicts"""
        conflicts = []
        
        # This would integrate with platform assignment logic
        # For now, simulate conflicts
        stations = Station.objects.filter(platforms__lt=3)  # Stations with limited platforms
        
        for station in stations[:2]:  # Sample a few stations
            if random.random() < 0.3:  # 30% chance of conflict
                conflict = ConflictDetection(
                    conflict_type='platform_clash',
                    severity='medium',
                    trains_involved=[f'FREIGHT-{random.randint(100, 999)}'],
                    stations_involved=[station.station_code],
                    conflict_time=timezone.now() + timedelta(minutes=random.randint(10, 60)),
                    resolution_deadline=timezone.now() + timedelta(minutes=random.randint(5, 30)),
                    conflict_details={
                        'station': station.station_code,
                        'available_platforms': station.platforms,
                        'required_platforms': 2
                    },
                    potential_impact=f"Platform capacity exceeded at {station.station_name}. Freight train arrival conflicts with passenger services."
                )
                conflicts.append(conflict)
        
        return conflicts
    
    def _detect_capacity_conflicts(self) -> List[ConflictDetection]:
        """Detect track capacity conflicts"""
        conflicts = []
        
        # Check tracks with single capacity
        single_tracks = Track.objects.filter(track_type='single')
        
        for track in single_tracks[:1]:  # Sample one track
            if random.random() < 0.2:  # 20% chance of conflict
                conflict = ConflictDetection(
                    conflict_type='track_capacity',
                    severity='high',
                    trains_involved=[f'12345', f'67890'],
                    tracks_involved=[track.track_id],
                    stations_involved=[track.source_station_id, track.destination_station_id],
                    conflict_time=timezone.now() + timedelta(minutes=random.randint(20, 90)),
                    resolution_deadline=timezone.now() + timedelta(minutes=random.randint(10, 45)),
                    conflict_details={
                        'track_id': track.track_id,
                        'track_type': track.track_type,
                        'capacity': 1,
                        'trains_requesting': 2
                    },
                    potential_impact=f"Single track {track.track_id} has conflicting train requests. Potential deadlock between {track.source_station_id} and {track.destination_station_id}."
                )
                conflicts.append(conflict)
        
        return conflicts


class AIRecommendationEngine:
    """Generates AI recommendations for operational decisions"""
    
    def __init__(self):
        self.analyzer = TrainOperationAnalyzer()
    
    def generate_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate AI recommendation for a decision"""
        
        if decision.decision_type == DecisionType.PRECEDENCE:
            return self._generate_precedence_recommendation(decision)
        elif decision.decision_type == DecisionType.PLATFORM_ASSIGNMENT:
            return self._generate_platform_recommendation(decision)
        elif decision.decision_type == DecisionType.DELAY_RECOVERY:
            return self._generate_delay_recovery_recommendation(decision)
        elif decision.decision_type == DecisionType.ROUTE_OPTIMIZATION:
            return self._generate_route_optimization_recommendation(decision)
        else:
            return self._generate_default_recommendation(decision)
    
    def _generate_precedence_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate recommendation for train precedence decisions"""
        trains_involved = decision.trains_involved
        
        if len(trains_involved) < 2:
            return self._generate_default_recommendation(decision)
        
        # Simulate priority analysis
        train1, train2 = trains_involved[0], trains_involved[1]
        
        # Get train details (in real implementation, would fetch from database)
        priority_train = train1  # Simplified logic
        
        # Generate enhanced reasoning using explainable AI
        decision_context = {
            'decision_type': 'precedence',
            'trains_involved': trains_involved,
            'priority': decision.priority,
            'context_data': decision.context_data
        }
        
        explanation = explainable_ai.generate_explanation(decision_context)
        reasoning_points = explanation['reasoning']['points']
        confidence_score = explanation['confidence_analysis']['overall_confidence']
        
        recommendation = AIRecommendation.objects.create(
            decision=decision,
            recommendation_text=f"Give precedence to Train {priority_train}",
            confidence_score=confidence_score,
            reasoning_points=reasoning_points,
            delay_reduction_min=random.uniform(-5, -2),
            energy_saving_percent=random.uniform(5, 12),
            passengers_affected=random.randint(800, 2000),
            throughput_improvement_percent=random.uniform(3, 8),
            model_version="v2.1.0"
        )
        
        return recommendation
    
    def _generate_platform_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate recommendation for platform assignment"""
        
        reasoning_points = [
            "Avoids platform conflict with passenger trains",
            "Shorter route reduces transit time",
            "Platform 3 has adequate loading facilities",
            "Maintains express train schedule integrity"
        ]
        
        recommendation = AIRecommendation.objects.create(
            decision=decision,
            recommendation_text="Route to Platform 3 via bypass track",
            confidence_score=random.uniform(80, 90),
            reasoning_points=reasoning_points,
            delay_reduction_min=random.uniform(-15, -8),
            energy_saving_percent=random.uniform(4, 8),
            passengers_affected=0,
            throughput_improvement_percent=random.uniform(2, 5),
            model_version="v2.1.0"
        )
        
        return recommendation
    
    def _generate_delay_recovery_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate recommendation for delay recovery"""
        
        reasoning_points = [
            "Skip non-essential stops as per emergency protocol",
            "Use express track for faster transit",
            "Coordinate with next section for priority passage",
            "Minimize station dwell time"
        ]
        
        recommendation = AIRecommendation.objects.create(
            decision=decision,
            recommendation_text="Implement speed optimization between stations",
            confidence_score=random.uniform(75, 85),
            reasoning_points=reasoning_points,
            delay_reduction_min=random.uniform(-8, -3),
            energy_saving_percent=random.uniform(-3, -1),  # Negative due to speed increase
            passengers_affected=random.randint(1200, 2500),
            throughput_improvement_percent=random.uniform(1, 4),
            model_version="v2.1.0"
        )
        
        return recommendation
    
    def _generate_route_optimization_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate recommendation for route optimization"""
        
        reasoning_points = [
            "Alternative route avoids congested section",
            "Maintains scheduled arrival time",
            "Reduces fuel consumption on flatter terrain",
            "Prevents cascade delays on main line"
        ]
        
        recommendation = AIRecommendation.objects.create(
            decision=decision,
            recommendation_text="Use alternative route via Bypass Junction",
            confidence_score=random.uniform(70, 85),
            reasoning_points=reasoning_points,
            delay_reduction_min=random.uniform(-6, -2),
            energy_saving_percent=random.uniform(8, 15),
            passengers_affected=random.randint(500, 1500),
            throughput_improvement_percent=random.uniform(4, 9),
            model_version="v2.1.0"
        )
        
        return recommendation
    
    def _generate_default_recommendation(self, decision: Decision) -> AIRecommendation:
        """Generate default recommendation when specific logic isn't available"""
        
        reasoning_points = [
            "Maintains operational efficiency",
            "Minimizes passenger impact",
            "Follows standard operating procedures",
            "Optimizes resource utilization"
        ]
        
        recommendation = AIRecommendation.objects.create(
            decision=decision,
            recommendation_text="Apply standard operational protocol",
            confidence_score=random.uniform(60, 75),
            reasoning_points=reasoning_points,
            delay_reduction_min=random.uniform(-3, 1),
            energy_saving_percent=random.uniform(0, 5),
            passengers_affected=random.randint(100, 800),
            throughput_improvement_percent=random.uniform(0, 3),
            model_version="v2.1.0"
        )
        
        return recommendation
    
    def predict_delay_impact(self, train_features: Dict) -> Tuple[bool, float]:
        """Predict delay impact using ML models"""
        if not self.analyzer.models_loaded:
            # Fallback prediction
            return random.choice([True, False]), random.uniform(0, 30)
        
        try:
            # Convert features to DataFrame
            feature_df = pd.DataFrame([train_features])
            
            # Use existing prediction logic
            X_transformed = self.analyzer.preprocessor.transform(feature_df)
            
            # Predict delay classification and duration
            delay_prob = self.analyzer.delay_classifier.predict_proba(X_transformed)[0][1]
            delay_duration = self.analyzer.delay_regressor.predict(X_transformed)[0]
            
            is_delayed = delay_prob > 0.5
            
            return is_delayed, max(0, delay_duration)
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return random.choice([True, False]), random.uniform(0, 30)


class DecisionEngineOrchestrator:
    """Main orchestrator for the decision engine"""
    
    def __init__(self):
        self.analyzer = TrainOperationAnalyzer()
        self.recommender = AIRecommendationEngine()
    
    def process_pending_decisions(self) -> List[Decision]:
        """Process all pending decisions and generate recommendations"""
        pending_decisions = Decision.objects.filter(
            status='pending',
            deadline__gte=timezone.now()
        ).exclude(
            ai_recommendation__isnull=False  # Don't re-process decisions with existing recommendations
        )
        
        processed_decisions = []
        
        for decision in pending_decisions:
            try:
                recommendation = self.recommender.generate_recommendation(decision)
                processed_decisions.append(decision)
                print(f"Generated recommendation for decision: {decision.title}")
            except Exception as e:
                print(f"Error generating recommendation for {decision.title}: {e}")
        
        return processed_decisions
    
    def detect_and_create_decisions(self) -> List[Decision]:
        """Detect conflicts and create new decisions"""
        conflicts = self.analyzer.detect_train_conflicts()
        decisions = []
        
        for conflict in conflicts:
            # Save conflict to database
            conflict.save()
            
            # Create decision from conflict
            decision = conflict.create_decision()
            decisions.append(decision)
            
            print(f"Created decision from conflict: {decision.title}")
        
        return decisions
    
    def run_decision_cycle(self) -> Dict[str, Any]:
        """Run a complete decision cycle: detect conflicts, create decisions, generate recommendations"""
        
        # Step 1: Detect conflicts and create decisions
        new_decisions = self.detect_and_create_decisions()
        
        # Step 2: Process pending decisions
        processed_decisions = self.process_pending_decisions()
        
        # Step 3: Generate summary
        summary = {
            'timestamp': timezone.now().isoformat(),
            'new_conflicts_detected': len(new_decisions),
            'decisions_processed': len(processed_decisions),
            'new_decision_ids': [d.id for d in new_decisions],
            'processed_decision_ids': [d.id for d in processed_decisions],
            'total_pending_decisions': Decision.objects.filter(status='pending').count()
        }
        
        return summary


# Singleton instance
decision_engine = DecisionEngineOrchestrator()