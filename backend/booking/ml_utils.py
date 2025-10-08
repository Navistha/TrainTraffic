import joblib
import os
import random
from django.conf import settings
import numpy as np
from .models import RouteComplexity, Station
import logging

logger = logging.getLogger(__name__)

# Default route complexity mapping (backup if DB doesn't have the data)
DEFAULT_ROUTE_COMPLEXITY = {
    ("Delhi", "Chandigarh"): 5,
    ("Delhi", "Jaipur"): 6,
    ("Delhi", "Lucknow"): 8,
    ("Delhi", "Kanpur"): 8,
    ("Delhi", "Dehradun"): 7,
    ("Delhi", "Varanasi"): 9,
    ("Delhi", "Agra"): 4,
    ("Delhi", "Gurugram"): 2,
    ("Chandigarh", "Jaipur"): 9,
    ("Chandigarh", "Lucknow"): 8,
    ("Chandigarh", "Kanpur"): 10,
    ("Chandigarh", "Dehradun"): 6,
    ("Chandigarh", "Varanasi"): 11,
    ("Chandigarh", "Agra"): 8,
    ("Chandigarh", "Gurugram"): 6,
    ("Jaipur", "Lucknow"): 9,
    ("Jaipur", "Kanpur"): 9,
    ("Jaipur", "Dehradun"): 10,
    ("Jaipur", "Varanasi"): 11,
    ("Jaipur", "Agra"): 5,
    ("Jaipur", "Gurugram"): 8,
    ("Lucknow", "Kanpur"): 4,
    ("Lucknow", "Dehradun"): 8,
    ("Lucknow", "Varanasi"): 6,
    ("Lucknow", "Agra"): 7,
    ("Lucknow", "Gurugram"): 9,
    ("Kanpur", "Dehradun"): 9,
    ("Kanpur", "Varanasi"): 5,
    ("Kanpur", "Agra"): 7,
    ("Kanpur", "Gurugram"): 9,
    ("Dehradun", "Varanasi"): 10,
    ("Dehradun", "Agra"): 8,
    ("Dehradun", "Gurugram"): 7,
    ("Varanasi", "Agra"): 11,
    ("Varanasi", "Gurugram"): 12,
    ("Agra", "Gurugram"): 5,
}


class DelayPredictor:
    """Machine learning model wrapper for predicting freight delays."""
    
    def __init__(self):
        """Initialize the delay predictor and load the ML model."""
        self.model = None
        self.scaler = None
        self.model_loaded = False
        self.load_model()
    
    def load_model(self):
        """Load the trained ML model and scaler"""
        try:
            # Try to load from the new location first
            model_path = os.path.join(settings.BASE_DIR, 'booking', 'ml_models', 'train_model.pkl')
            
            if not os.path.exists(model_path):
                # Fallback to old location if it exists
                old_path = os.path.join(settings.BASE_DIR, 'BOOKING', 'train_model.pkl')
                if os.path.exists(old_path):
                    model_path = old_path
                else:
                    logger.warning("ML model file not found. Delay prediction will use fallback logic.")
                    return
            
            self.model, self.scaler = joblib.load(model_path)
            self.model_loaded = True
            logger.info("ML model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load ML model: {str(e)}")
            self.model_loaded = False
    
    def get_route_complexity(self, origin_name, destination_name):
        """Get route complexity from database or fallback to default values"""
        try:
            # Try to get from database first
            origin = Station.objects.get(name__iexact=origin_name)
            destination = Station.objects.get(name__iexact=destination_name)
            
            route_complexity = RouteComplexity.objects.filter(
                origin=origin, destination=destination
            ).first()
            
            if route_complexity:
                return route_complexity.complexity_score
            
            # Try reverse direction
            route_complexity = RouteComplexity.objects.filter(
                origin=destination, destination=origin
            ).first()
            
            if route_complexity:
                return route_complexity.complexity_score
            
        except Station.DoesNotExist:
            pass
        except Exception as e:
            logger.warning(f"Error fetching route complexity from DB: {str(e)}")
        
        # Fallback to default values
        key1 = (origin_name, destination_name)
        key2 = (destination_name, origin_name)
        
        return DEFAULT_ROUTE_COMPLEXITY.get(key1) or DEFAULT_ROUTE_COMPLEXITY.get(key2) or 10
    
    def predict_delay(self, quantity, origin_name, destination_name):
        """
        Predict if freight will be delayed
        
        Args:
            quantity (float): Quantity of freight in tons
            origin_name (str): Origin station name
            destination_name (str): Destination station name
            
        Returns:
            tuple: (is_delayed: bool, probability: float, route_complexity: int)
        """
        route_complexity = self.get_route_complexity(origin_name, destination_name)
        
        if self.model_loaded and self.model is not None and self.scaler is not None:
            try:
                # Prepare features for prediction
                features = np.array([[quantity, route_complexity]])
                features_scaled = self.scaler.transform(features)
                
                # Get prediction and probability
                prediction = self.model.predict(features_scaled)[0]
                probability = self.model.predict_proba(features_scaled)[0][1]  # Probability of delay
                
                return bool(prediction), float(probability), route_complexity
                
            except Exception as e:
                logger.error(f"Error during ML prediction: {str(e)}")
        
        # Fallback prediction logic
        is_delayed = self._fallback_prediction(quantity, route_complexity)
        probability = self._calculate_fallback_probability(quantity, route_complexity)
        
        return is_delayed, probability, route_complexity
    
    def _fallback_prediction(self, quantity, route_complexity):
        """Fallback delay prediction logic when ML model is not available"""
        # Simple rule-based prediction
        if quantity > 120 or route_complexity > 10 or (quantity > 80 and route_complexity > 7):
            return True
        return False
    
    def _calculate_fallback_probability(self, quantity, route_complexity):
        """Calculate delay probability using fallback logic"""
        # Simple probability calculation based on quantity and complexity
        quantity_factor = min(quantity / 200, 1.0)  # Normalize to 0-1
        complexity_factor = min(route_complexity / 15, 1.0)  # Normalize to 0-1
        
        # Weighted combination
        probability = (quantity_factor * 0.6 + complexity_factor * 0.4)
        
        # Add some randomness and ensure it's between 0.1 and 0.9
        probability += (random.random() - 0.5) * 0.2
        return max(0.1, min(0.9, probability))
    
    def calculate_travel_time(self, quantity, route_complexity):
        """Calculate estimated travel time in hours"""
        # Base time + complexity factor + quantity factor
        base_hours = 4
        complexity_hours = route_complexity * 0.5
        quantity_hours = quantity / 20
        
        return base_hours + complexity_hours + quantity_hours


# Global instance
delay_predictor = DelayPredictor()


def predict_freight_delay(quantity, origin_name, destination_name):
    """
    Convenience function to predict freight delay
    
    Args:
        quantity (float): Quantity in tons
        origin_name (str): Origin station name
        destination_name (str): Destination station name
        
    Returns:
        dict: Prediction results
    """
    is_delayed, probability, route_complexity = delay_predictor.predict_delay(
        quantity, origin_name, destination_name
    )
    
    travel_hours = delay_predictor.calculate_travel_time(quantity, route_complexity)
    
    return {
        'predicted_delay': is_delayed,
        'delay_probability': probability,
        'route_complexity': route_complexity,
        'estimated_travel_hours': travel_hours
    }