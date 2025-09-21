# TrainTraffic Booking System

A comprehensive Django-based freight booking system for railway transportation with AI-powered delay prediction.

## Overview

This booking system has been converted from a Flask-based implementation to a proper Django app with the following features:

- **Freight Booking Management**: Book, track, and manage freight shipments
- **Station Management**: Manage railway stations with geolocation support
- **Material Type Management**: Handle different types of freight materials
- **Route Complexity Analysis**: Calculate and store route difficulty metrics
- **AI Delay Prediction**: ML-powered delay prediction using scikit-learn
- **Comprehensive APIs**: RESTful APIs for all operations
- **Admin Interface**: Django admin for managing all entities

## Models

### Station
- Railway stations with city, state, and location data
- Support for active/inactive status
- Geolocation coordinates (latitude/longitude)

### MaterialType  
- Different types of freight materials (Coal, Steel, Food, etc.)
- Hazardous material classification
- Unit specifications (tons, kg, etc.)

### RouteComplexity
- Route difficulty scoring between stations
- Distance and estimated travel time
- Used for delay prediction algorithms

### Freight
- Complete freight booking records
- Status tracking (free, booked, in_transit, arrived, etc.)
- ML-based delay prediction
- Tracking functionality
- Audit trail with user associations

## API Endpoints

### Freight Management
- `GET /api/booking/freights/` - List all freights
- `POST /api/booking/freights/` - Create new freight
- `GET /api/booking/freights/{id}/` - Get freight details
- `GET /api/booking/freights/{id}/track/` - Track freight progress
- `PATCH /api/booking/freights/{id}/update_status/` - Update freight status

### Booking Operations
- `POST /api/booking/book/` - Book new freight shipment
- `GET /api/booking/freights/station/?station={name}` - Get freights by station
- `GET /api/booking/freights/statistics/` - Get dashboard statistics

### Master Data
- `GET /api/booking/stations/` - List stations
- `GET /api/booking/materials/` - List material types  
- `GET /api/booking/routes/` - List route complexities

### Legacy Support
- `GET /api/booking/track/{freight_id}/` - Legacy tracking endpoint

## ML Delay Prediction

The system includes a trained machine learning model for predicting freight delays:

### Features Used
- **Quantity**: Freight quantity in tons
- **Route Complexity**: Difficulty score of the route (1-20)

### Model Performance
- **Algorithm**: Logistic Regression with StandardScaler
- **Accuracy**: ~94% on test data
- **Training Data**: 1000 synthetic freight records

### Prediction Logic
The system predicts delays based on:
- High quantity shipments (>120 tons)
- Complex routes (score >10)
- Combined high quantity and moderate complexity

### Fallback Logic
If ML model fails to load, the system uses rule-based prediction:
- Delay if quantity > 120 OR complexity > 10 OR (quantity > 80 AND complexity > 7)

## Installation & Setup

### 1. Install Dependencies
```bash
pip install django-filter drf-spectacular django-money geopy python-dateutil structlog drf-yasg
```

### 2. Add to Django Settings
```python
INSTALLED_APPS = [
    # ... other apps
    'django_filters',
    'booking',
]
```

### 3. Include URLs
```python
# urls.py
urlpatterns = [
    # ... other URLs  
    path('api/booking/', include('booking.urls')),
]
```

### 4. Run Migrations
```bash
python manage.py makemigrations booking
python manage.py migrate
```

### 5. Populate Initial Data
```bash
python manage.py populate_booking_data
```

### 6. Train ML Model (Optional)
```bash
cd booking/ml_models
python train_model.py
```

## Usage Examples

### Book a Freight
```bash
curl -X POST http://localhost:8000/api/booking/book/ \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Delhi", 
    "destination": "Mumbai",
    "material_type": "Steel",
    "quantity": 150,
    "scheduled_date": "2024-01-15"
  }'
```

### Track a Freight
```bash
curl http://localhost:8000/api/booking/track/F1234567/
```

### Get Freight Statistics
```bash
curl http://localhost:8000/api/booking/freights/statistics/
```

## Admin Interface

Access the Django admin at `/admin/` to manage:
- Stations with filtering by state and status
- Material types with hazardous classification
- Route complexities with scoring
- Freight bookings with comprehensive filtering and status tracking

## Data Population

The system includes a management command to populate initial data:

### Stations
- Delhi, Mumbai, Chennai, Kolkata, Bangalore
- Chandigarh, Jaipur, Lucknow, Kanpur, Dehradun
- Varanasi, Agra, Gurugram, Rewari, Mirzapur, Anantnag

### Material Types
- Coal, Steel, Food, Oil (hazardous)
- Cement, Grain, Iron Ore, Chemicals (hazardous)
- Fertilizer, Textiles

### Route Complexities
- 36 pre-configured routes between major stations
- Complexity scores from 2 (Delhi-Gurugram) to 12 (Varanasi-Gurugram)
- Distance and estimated travel time data

## File Structure
```
booking/
├── models.py              # Core data models
├── serializers.py         # DRF serializers  
├── views.py              # API views and viewsets
├── urls.py               # URL routing
├── admin.py              # Admin interface
├── ml_utils.py           # ML prediction utilities
├── ml_models/            # ML model files
│   ├── train_model.py    # Model training script
│   └── train_model.pkl   # Trained model
├── management/           # Django management commands
│   └── commands/
│       └── populate_booking_data.py
└── migrations/           # Database migrations
```

## Migration from Flask

This system replaces the original Flask-based booking system (`BOOKING/`) with:

### Improvements
- **Proper Django Integration**: Full Django ORM, admin, and authentication
- **Enhanced APIs**: RESTful design with proper serialization
- **Better Error Handling**: Comprehensive validation and error responses  
- **Scalable Architecture**: Proper separation of concerns
- **Database Normalization**: Relational models with foreign keys
- **Admin Interface**: Web-based management interface
- **Audit Trail**: User tracking and timestamps
- **ML Integration**: Better model loading and fallback mechanisms

### API Compatibility
The new system maintains backward compatibility with key endpoints:
- `/track/{freight_id}/` continues to work
- `/freights/station/` maintains the same query parameter format
- Response formats are enhanced but backward compatible

## Contributing

When extending this system:
1. Follow Django best practices
2. Add comprehensive docstrings
3. Include proper error handling
4. Update serializers for new fields
5. Add admin configurations for new models
6. Include management commands for data operations

## Troubleshooting

### Common Issues
1. **Migration Conflicts**: If migrations fail, check for conflicts with existing apps
2. **ML Model Loading**: Ensure train_model.pkl is in the correct path
3. **Database Issues**: Check PostgreSQL connection settings
4. **Missing Dependencies**: Install all packages from requirements_booking.txt

### Performance Tips
1. Use select_related() for foreign key queries
2. Implement pagination for large datasets  
3. Add database indexes for frequently queried fields
4. Cache route complexity calculations
5. Use bulk operations for large data imports