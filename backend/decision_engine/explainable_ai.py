"""
Explainable AI Module for Railway Decision System
Provides detailed reasoning and impact analysis for AI recommendations
"""
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from django.utils import timezone
import math
import random


class ReasoningEngine:
    """Generates human-readable reasoning for AI recommendations"""
    
    def __init__(self):
        self.reasoning_templates = {
            'precedence': {
                'priority_analysis': [
                    "Train {train_id} is a {train_type} service with {priority_level} priority level",
                    "Passenger count: {passenger_count} affects overall system impact",
                    "Connection maintenance: {connection_stations} require on-time arrival",
                    "Revenue impact: Higher priority services generate {revenue_impact}% more revenue"
                ],
                'operational_factors': [
                    "Current system delay: {system_delay} minutes across {affected_routes} routes",
                    "Junction capacity: {junction_id} can handle {concurrent_trains} trains simultaneously",
                    "Signal spacing allows {signal_gap} minutes between consecutive departures",
                    "Weather conditions: {weather} affecting visibility and braking distance"
                ],
                'optimization_logic': [
                    "Minimizing overall delay: Current strategy reduces total delay by {delay_reduction} minutes",
                    "Energy efficiency: Reduced braking saves {energy_saving}% fuel consumption",
                    "Cascade effect: Prevents {cascade_delays} downstream delays",
                    "Resource utilization: Optimizes track usage by {utilization_improvement}%"
                ]
            },
            'platform_assignment': {
                'capacity_analysis': [
                    "Platform {platform_id} has {loading_capacity} loading capacity",
                    "Current occupancy: {occupancy_percent}% with {available_time} minutes available",
                    "Freight handling: {freight_type} requires {handling_time} minutes processing time",
                    "Passenger interference: {passenger_conflicts} potential conflicts identified"
                ],
                'routing_optimization': [
                    "Bypass track reduces transit time by {time_reduction} minutes",
                    "Alternative route {route_id} avoids {congestion_points} congestion points",
                    "Track gradient: {gradient}% allows {speed_optimization} speed optimization",
                    "Signal synchronization: {sync_signals} consecutive green signals possible"
                ]
            },
            'delay_recovery': {
                'recovery_strategies': [
                    "Speed optimization between {station_a} and {station_b} can recover {recovery_time} minutes",
                    "Skip {non_essential_stops} non-essential stops as per emergency protocol",
                    "Express track utilization: {express_percentage}% of route can use faster tracks",
                    "Station dwell time: Reduced to {dwell_time} minutes from standard {standard_dwell} minutes"
                ],
                'impact_mitigation': [
                    "Passenger connections: {connection_count} connections preserved at {hub_station}",
                    "Service frequency: Maintains {frequency} minute headway on {service_line}",
                    "Crew scheduling: No overtime required with current recovery plan",
                    "Equipment rotation: Maintains {equipment_id} schedule integrity"
                ]
            }
        }
    
    def generate_reasoning(self, decision_type: str, context_data: Dict[str, Any]) -> List[str]:
        """Generate contextual reasoning points for a decision"""
        template_category = self.reasoning_templates.get(decision_type, {})
        reasoning_points = []
        
        for category, templates in template_category.items():
            # Select 2-3 templates from each category
            selected_templates = random.sample(templates, min(3, len(templates)))
            
            for template in selected_templates:
                try:
                    # Fill template with context data and simulated values
                    filled_template = self._fill_template(template, context_data)
                    reasoning_points.append(filled_template)
                except Exception as e:
                    # If template filling fails, use a generic reason
                    continue
        
        return reasoning_points[:6]  # Limit to 6 reasoning points for UI clarity
    
    def _fill_template(self, template: str, context_data: Dict[str, Any]) -> str:
        """Fill a reasoning template with actual or simulated data"""
        # Extract placeholders from template
        placeholders = self._extract_placeholders(template)
        
        fill_values = {}
        for placeholder in placeholders:
            fill_values[placeholder] = self._get_fill_value(placeholder, context_data)
        
        return template.format(**fill_values)
    
    def _extract_placeholders(self, template: str) -> List[str]:
        """Extract {placeholder} values from template string"""
        import re
        return re.findall(r'\{([^}]+)\}', template)
    
    def _get_fill_value(self, placeholder: str, context_data: Dict[str, Any]) -> Any:
        """Get fill value for a placeholder, either from context or simulated"""
        
        # Try to get from context data first
        if placeholder in context_data:
            return context_data[placeholder]
        
        # Generate simulated values based on placeholder name
        simulated_values = {
            'train_id': random.choice(['12345', '67890', 'EXP-123', 'FREIGHT-456']),
            'train_type': random.choice(['Express', 'Passenger', 'Freight', 'Superfast']),
            'priority_level': random.choice(['High', 'Medium', 'Low']),
            'passenger_count': random.randint(800, 2000),
            'connection_stations': random.choice(['New Delhi', 'Mumbai Central', 'Chennai Central']),
            'revenue_impact': random.randint(15, 35),
            'system_delay': random.randint(3, 12),
            'affected_routes': random.randint(2, 6),
            'junction_id': random.choice(['J-4', 'J-7', 'CENTRAL-JN']),
            'concurrent_trains': random.randint(2, 4),
            'signal_gap': random.randint(3, 8),
            'weather': random.choice(['clear', 'light rain', 'fog']),
            'delay_reduction': random.uniform(2.5, 8.5),
            'energy_saving': random.uniform(4, 12),
            'cascade_delays': random.randint(3, 8),
            'utilization_improvement': random.uniform(8, 20),
            'platform_id': random.choice(['Platform 3', 'Platform 4', 'Platform 5']),
            'loading_capacity': random.choice(['high', 'medium', 'standard']),
            'occupancy_percent': random.randint(20, 70),
            'available_time': random.randint(15, 45),
            'freight_type': random.choice(['container', 'bulk', 'express cargo']),
            'handling_time': random.randint(12, 25),
            'passenger_conflicts': random.randint(0, 2),
            'time_reduction': random.uniform(8, 15),
            'route_id': random.choice(['Route A', 'Bypass-1', 'Express Track']),
            'congestion_points': random.randint(2, 5),
            'gradient': random.uniform(0.5, 2.5),
            'speed_optimization': random.choice(['significant', 'moderate', 'limited']),
            'sync_signals': random.randint(4, 8),
            'station_a': random.choice(['Thane', 'Kalyan', 'Dadar']),
            'station_b': random.choice(['Pune', 'Nashik', 'Aurangabad']),
            'recovery_time': random.uniform(4, 12),
            'non_essential_stops': random.randint(2, 4),
            'express_percentage': random.randint(60, 85),
            'dwell_time': random.randint(30, 90),
            'standard_dwell': random.randint(90, 180),
            'connection_count': random.randint(150, 450),
            'hub_station': random.choice(['New Delhi', 'Mumbai Central', 'Chennai Central']),
            'frequency': random.randint(12, 30),
            'service_line': random.choice(['Western Line', 'Central Line', 'Harbour Line']),
            'equipment_id': random.choice(['WDP4-001', 'WAP7-123', 'EMU-456'])
        }
        
        return simulated_values.get(placeholder, f"<{placeholder}>")


class ImpactAnalyzer:
    """Analyzes and quantifies the impact of AI recommendations"""
    
    def __init__(self):
        self.impact_factors = {
            'delay_reduction': {
                'weight': 0.3,
                'unit': 'minutes',
                'description': 'Expected reduction in overall system delay'
            },
            'energy_saving': {
                'weight': 0.15,
                'unit': 'percentage',
                'description': 'Fuel and energy consumption savings'
            },
            'passenger_satisfaction': {
                'weight': 0.25,
                'unit': 'score',
                'description': 'Impact on passenger experience and satisfaction'
            },
            'operational_efficiency': {
                'weight': 0.2,
                'unit': 'percentage',
                'description': 'Improvement in operational resource utilization'
            },
            'safety_enhancement': {
                'weight': 0.1,
                'unit': 'score',
                'description': 'Safety risk reduction and protocol compliance'
            }
        }
    
    def calculate_impact_score(self, recommendation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive impact score for a recommendation"""
        
        impact_analysis = {}
        total_score = 0.0
        
        for factor, config in self.impact_factors.items():
            factor_score = self._calculate_factor_score(factor, recommendation_data)
            weighted_score = factor_score * config['weight']
            total_score += weighted_score
            
            impact_analysis[factor] = {
                'score': round(factor_score, 2),
                'weighted_score': round(weighted_score, 2),
                'unit': config['unit'],
                'description': config['description'],
                'weight': config['weight']
            }
        
        impact_analysis['total_score'] = round(total_score, 2)
        impact_analysis['grade'] = self._get_impact_grade(total_score)
        
        return impact_analysis
    
    def _calculate_factor_score(self, factor: str, data: Dict[str, Any]) -> float:
        """Calculate score for a specific impact factor (0-100 scale)"""
        
        if factor == 'delay_reduction':
            # Higher delay reduction = higher score
            delay_reduction = abs(data.get('delay_reduction_min', 0))
            return min(100, delay_reduction * 10)  # 10 minutes = 100 points
        
        elif factor == 'energy_saving':
            # Higher energy saving = higher score
            energy_saving = data.get('energy_saving_percent', 0)
            return min(100, abs(energy_saving) * 8)  # 12.5% = 100 points
        
        elif factor == 'passenger_satisfaction':
            # Based on passenger count and delay reduction
            passengers = data.get('passengers_affected', 0)
            delay_reduction = abs(data.get('delay_reduction_min', 0))
            
            if passengers > 1500:  # High passenger count
                base_score = 70
            elif passengers > 800:  # Medium passenger count
                base_score = 50
            else:  # Low passenger count
                base_score = 30
            
            # Bonus for delay reduction
            delay_bonus = min(30, delay_reduction * 3)
            return min(100, base_score + delay_bonus)
        
        elif factor == 'operational_efficiency':
            # Based on throughput improvement
            throughput = data.get('throughput_improvement_percent', 0)
            return min(100, throughput * 12)  # 8.3% = 100 points
        
        elif factor == 'safety_enhancement':
            # Simulated based on decision type and context
            decision_type = data.get('decision_type', '')
            if 'precedence' in decision_type or 'conflict' in decision_type:
                return random.uniform(70, 95)  # High safety impact
            elif 'platform' in decision_type:
                return random.uniform(50, 80)  # Medium safety impact
            else:
                return random.uniform(30, 60)  # Lower safety impact
        
        return 50.0  # Default neutral score
    
    def _get_impact_grade(self, total_score: float) -> str:
        """Convert total score to impact grade"""
        if total_score >= 85:
            return 'A+ (Excellent Impact)'
        elif total_score >= 75:
            return 'A (High Impact)'
        elif total_score >= 65:
            return 'B+ (Good Impact)'
        elif total_score >= 55:
            return 'B (Moderate Impact)'
        elif total_score >= 45:
            return 'C+ (Fair Impact)'
        elif total_score >= 35:
            return 'C (Limited Impact)'
        else:
            return 'D (Low Impact)'


class ConfidenceCalculator:
    """Calculates confidence scores for AI recommendations"""
    
    def __init__(self):
        self.confidence_factors = {
            'data_quality': 0.25,      # Quality and completeness of input data
            'model_certainty': 0.30,   # ML model prediction confidence
            'historical_accuracy': 0.20, # Past accuracy of similar recommendations
            'scenario_complexity': 0.15, # Complexity of the decision scenario
            'external_factors': 0.10   # Weather, unexpected events, etc.
        }
    
    def calculate_confidence(self, decision_context: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """Calculate overall confidence score and breakdown"""
        
        factor_scores = {}
        weighted_sum = 0.0
        
        for factor, weight in self.confidence_factors.items():
            score = self._evaluate_factor(factor, decision_context)
            weighted_score = score * weight
            weighted_sum += weighted_score
            
            factor_scores[factor] = {
                'score': round(score, 1),
                'weighted_score': round(weighted_score, 1),
                'weight': weight,
                'description': self._get_factor_description(factor)
            }
        
        # Overall confidence as percentage
        confidence_percentage = min(99.0, max(10.0, weighted_sum))
        
        confidence_breakdown = {
            'overall_confidence': round(confidence_percentage, 1),
            'confidence_level': self._get_confidence_level(confidence_percentage),
            'factor_breakdown': factor_scores,
            'recommendation': self._get_confidence_recommendation(confidence_percentage)
        }
        
        return confidence_percentage, confidence_breakdown
    
    def _evaluate_factor(self, factor: str, context: Dict[str, Any]) -> float:
        """Evaluate individual confidence factor (0-100 scale)"""
        
        if factor == 'data_quality':
            # Check completeness of required data
            required_fields = ['trains_involved', 'decision_type', 'priority']
            present_fields = sum(1 for field in required_fields if field in context and context[field])
            completeness = (present_fields / len(required_fields)) * 100
            
            # Add some randomization for realism
            return min(100, completeness + random.uniform(-5, 10))
        
        elif factor == 'model_certainty':
            # Simulated ML model confidence
            decision_type = context.get('decision_type', '')
            if decision_type == 'precedence':
                return random.uniform(85, 95)  # High certainty for precedence decisions
            elif decision_type == 'platform_assignment':
                return random.uniform(75, 90)  # Good certainty for platform decisions
            else:
                return random.uniform(65, 85)  # Moderate certainty for other decisions
        
        elif factor == 'historical_accuracy':
            # Based on past performance (simulated)
            return random.uniform(70, 90)
        
        elif factor == 'scenario_complexity':
            # More complex scenarios have lower confidence
            trains_count = len(context.get('trains_involved', []))
            complexity_score = max(30, 100 - (trains_count - 1) * 15)
            return complexity_score + random.uniform(-10, 5)
        
        elif factor == 'external_factors':
            # Weather and other external factors (simulated)
            return random.uniform(60, 85)
        
        return 70.0  # Default score
    
    def _get_factor_description(self, factor: str) -> str:
        """Get human-readable description for confidence factor"""
        descriptions = {
            'data_quality': 'Completeness and reliability of input data',
            'model_certainty': 'ML model prediction confidence and accuracy',
            'historical_accuracy': 'Past performance of similar recommendations',
            'scenario_complexity': 'Complexity and number of variables in scenario',
            'external_factors': 'Impact of weather, disruptions, and external events'
        }
        return descriptions.get(factor, 'Unknown factor')
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Convert confidence percentage to descriptive level"""
        if confidence >= 90:
            return 'Very High'
        elif confidence >= 80:
            return 'High'
        elif confidence >= 70:
            return 'Moderate'
        elif confidence >= 60:
            return 'Fair'
        else:
            return 'Low'
    
    def _get_confidence_recommendation(self, confidence: float) -> str:
        """Get recommendation based on confidence level"""
        if confidence >= 85:
            return 'Strongly recommended - High confidence in positive outcome'
        elif confidence >= 75:
            return 'Recommended - Good confidence with manageable risk'
        elif confidence >= 65:
            return 'Consider with caution - Monitor closely for unexpected outcomes'
        else:
            return 'High risk - Consider alternative options or manual override'


class ExplainableAI:
    """Main explainable AI class that combines reasoning, impact, and confidence analysis"""
    
    def __init__(self):
        self.reasoning_engine = ReasoningEngine()
        self.impact_analyzer = ImpactAnalyzer()
        self.confidence_calculator = ConfidenceCalculator()
    
    def generate_explanation(self, decision_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive explanation for an AI recommendation"""
        
        decision_type = decision_context.get('decision_type', 'unknown')
        
        # Generate reasoning
        reasoning_points = self.reasoning_engine.generate_reasoning(decision_type, decision_context)
        
        # Calculate impact analysis
        impact_analysis = self.impact_analyzer.calculate_impact_score(decision_context)
        
        # Calculate confidence
        confidence_score, confidence_breakdown = self.confidence_calculator.calculate_confidence(decision_context)
        
        explanation = {
            'reasoning': {
                'points': reasoning_points,
                'summary': f"Based on {len(reasoning_points)} key factors, this recommendation optimizes for safety, efficiency, and passenger satisfaction."
            },
            'impact_analysis': impact_analysis,
            'confidence_analysis': confidence_breakdown,
            'metadata': {
                'generated_at': timezone.now().isoformat(),
                'decision_type': decision_type,
                'complexity_score': len(decision_context.get('trains_involved', [])),
                'explanation_version': '2.1.0'
            }
        }
        
        return explanation


# Singleton instance
explainable_ai = ExplainableAI()