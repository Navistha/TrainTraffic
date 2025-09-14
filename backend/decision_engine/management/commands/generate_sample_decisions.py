from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decision_engine.models import Decision, DecisionType, DecisionPriority
from decision_engine.ai_engine import decision_engine
import random


class Command(BaseCommand):
    help = 'Generate sample decisions for testing the decision center'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of sample decisions to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        sample_decisions = [
            {
                'title': 'Junction J-4 Precedence Decision',
                'description': 'Choose precedence between Rajdhani Express (12951) and Grand Trunk Express (12615)',
                'decision_type': DecisionType.PRECEDENCE,
                'priority': DecisionPriority.HIGH,
                'trains_involved': ['12951', '12615'],
                'stations_involved': ['J-4'],
                'context_data': {
                    'junction': 'J-4',
                    'conflict_time': '2024-09-13T14:30:00Z',
                    'passenger_count_12951': 1200,
                    'passenger_count_12615': 800
                }
            },
            {
                'title': 'Platform Assignment for Freight-401',
                'description': 'Select platform for incoming container freight to avoid passenger train conflicts',
                'decision_type': DecisionType.PLATFORM_ASSIGNMENT,
                'priority': DecisionPriority.MEDIUM,
                'trains_involved': ['FREIGHT-401'],
                'stations_involved': ['MUMBAI_CENTRAL'],
                'context_data': {
                    'freight_type': 'container',
                    'arrival_time': '2024-09-13T16:00:00Z',
                    'available_platforms': [3, 4, 5]
                }
            },
            {
                'title': 'Delay Recovery Strategy',
                'description': 'Optimize timing for Grand Trunk Express to recover 8-minute delay',
                'decision_type': DecisionType.DELAY_RECOVERY,
                'priority': DecisionPriority.MEDIUM,
                'trains_involved': ['12615'],
                'stations_involved': ['DADAR', 'THANE'],
                'context_data': {
                    'current_delay_minutes': 8,
                    'next_connection_station': 'NEW_DELHI',
                    'passenger_connections': 450
                }
            },
            {
                'title': 'Route Optimization - Mumbai-Pune Section',
                'description': 'Select optimal route for express train due to track maintenance',
                'decision_type': DecisionType.ROUTE_OPTIMIZATION,
                'priority': DecisionPriority.LOW,
                'trains_involved': ['16119'],
                'stations_involved': ['MUMBAI_CST', 'PUNE'],
                'context_data': {
                    'maintenance_section': 'KARJAT-LONAVALA',
                    'alternative_routes': ['via_PANVEL', 'via_KALYAN'],
                    'estimated_delay_savings': 12
                }
            },
            {
                'title': 'Emergency Track Clearance',
                'description': 'Resolve emergency situation - obstacle on main line',
                'decision_type': DecisionType.CONFLICT_RESOLUTION,
                'priority': DecisionPriority.HIGH,
                'trains_involved': ['12138', '12139', 'FREIGHT-234'],
                'stations_involved': ['KALYAN', 'DOMBIVLI'],
                'context_data': {
                    'emergency_type': 'track_obstruction',
                    'affected_section': 'KALYAN-DOMBIVLI',
                    'estimated_clearance_time': 45,
                    'diverted_trains': 3
                }
            }
        ]
        
        created_count = 0
        
        for i in range(count):
            # Select a sample decision template
            sample = random.choice(sample_decisions)
            
            # Create decision with some randomization
            decision = Decision.objects.create(
                title=sample['title'],
                description=sample['description'],
                decision_type=sample['decision_type'],
                priority=sample['priority'],
                trains_involved=sample['trains_involved'],
                stations_involved=sample['stations_involved'],
                deadline=timezone.now() + timedelta(minutes=random.randint(15, 180)),
                time_remaining=random.randint(5, 120),
                context_data=sample['context_data']
            )
            
            # Generate AI recommendation for the decision
            try:
                recommendation = decision_engine.recommender.generate_recommendation(decision)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created decision: {decision.title} with AI recommendation')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create recommendation for {decision.title}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully generated {created_count} sample decisions')
        )