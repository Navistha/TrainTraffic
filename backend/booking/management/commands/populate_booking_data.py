from django.core.management.base import BaseCommand
from booking.models import Station, MaterialType, RouteComplexity
from datetime import datetime


class Command(BaseCommand):
    help = 'Populate initial data for booking system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            RouteComplexity.objects.all().delete()
            MaterialType.objects.all().delete()
            Station.objects.all().delete()

        self.stdout.write('Populating stations...')
        self.create_stations()
        
        self.stdout.write('Populating material types...')
        self.create_material_types()
        
        self.stdout.write('Populating route complexities...')
        self.create_route_complexities()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated booking data!')
        )

    def create_stations(self):
        """Create initial stations"""
        stations_data = [
            {"name": "Delhi", "city": "Delhi", "state": "Delhi"},
            {"name": "Chandigarh", "city": "Chandigarh", "state": "Punjab"},
            {"name": "Jaipur", "city": "Jaipur", "state": "Rajasthan"},
            {"name": "Lucknow", "city": "Lucknow", "state": "Uttar Pradesh"},
            {"name": "Kanpur", "city": "Kanpur", "state": "Uttar Pradesh"},
            {"name": "Dehradun", "city": "Dehradun", "state": "Uttarakhand"},
            {"name": "Varanasi", "city": "Varanasi", "state": "Uttar Pradesh"},
            {"name": "Agra", "city": "Agra", "state": "Uttar Pradesh"},
            {"name": "Gurugram", "city": "Gurugram", "state": "Haryana"},
            {"name": "Rewari", "city": "Rewari", "state": "Haryana"},
            {"name": "Mirzapur", "city": "Mirzapur", "state": "Uttar Pradesh"},
            {"name": "Anantnag", "city": "Anantnag", "state": "Jammu and Kashmir"},
        ]
        
        for station_data in stations_data:
            station, created = Station.objects.get_or_create(
                name=station_data["name"],
                defaults={
                    "city": station_data["city"],
                    "state": station_data["state"],
                    "is_active": True
                }
            )
            if created:
                self.stdout.write(f'  Created station: {station.name}')
            else:
                self.stdout.write(f'  Station already exists: {station.name}')

    def create_material_types(self):
        """Create initial material types"""
        materials_data = [
            {"name": "Coal", "description": "Coal for energy production", "unit": "tons"},
            {"name": "Steel", "description": "Steel products and raw materials", "unit": "tons"},
            {"name": "Food", "description": "Food grains and processed food", "unit": "tons"},
            {"name": "Oil", "description": "Petroleum products and lubricants", "unit": "tons", "is_hazardous": True},
            {"name": "Cement", "description": "Cement and construction materials", "unit": "tons"},
            {"name": "Grain", "description": "Agricultural grains and cereals", "unit": "tons"},
            {"name": "Iron Ore", "description": "Iron ore and mining products", "unit": "tons"},
            {"name": "Chemicals", "description": "Industrial chemicals", "unit": "tons", "is_hazardous": True},
            {"name": "Fertilizer", "description": "Agricultural fertilizers", "unit": "tons"},
            {"name": "Textiles", "description": "Textile products and fabrics", "unit": "tons"},
        ]
        
        for material_data in materials_data:
            material, created = MaterialType.objects.get_or_create(
                name=material_data["name"],
                defaults={
                    "description": material_data["description"],
                    "unit": material_data["unit"],
                    "is_hazardous": material_data.get("is_hazardous", False)
                }
            )
            if created:
                self.stdout.write(f'  Created material: {material.name}')
            else:
                self.stdout.write(f'  Material already exists: {material.name}')

    def create_route_complexities(self):
        """Create route complexity data"""
        # Get all stations
        stations = {station.name: station for station in Station.objects.all()}
        
        # Route complexity mapping from the original Flask app
        route_data = {
            ("Delhi", "Chandigarh"): {"score": 5, "distance": 250, "hours": 8},
            ("Delhi", "Jaipur"): {"score": 6, "distance": 280, "hours": 9},
            ("Delhi", "Lucknow"): {"score": 8, "distance": 556, "hours": 12},
            ("Delhi", "Kanpur"): {"score": 8, "distance": 440, "hours": 10},
            ("Delhi", "Dehradun"): {"score": 7, "distance": 248, "hours": 8},
            ("Delhi", "Varanasi"): {"score": 9, "distance": 764, "hours": 16},
            ("Delhi", "Agra"): {"score": 4, "distance": 233, "hours": 7},
            ("Delhi", "Gurugram"): {"score": 2, "distance": 30, "hours": 2},
            ("Chandigarh", "Jaipur"): {"score": 9, "distance": 512, "hours": 12},
            ("Chandigarh", "Lucknow"): {"score": 8, "distance": 678, "hours": 14},
            ("Chandigarh", "Kanpur"): {"score": 10, "distance": 562, "hours": 13},
            ("Chandigarh", "Dehradun"): {"score": 6, "distance": 168, "hours": 6},
            ("Chandigarh", "Varanasi"): {"score": 11, "distance": 886, "hours": 18},
            ("Chandigarh", "Agra"): {"score": 8, "distance": 481, "hours": 11},
            ("Chandigarh", "Gurugram"): {"score": 6, "distance": 280, "hours": 8},
            ("Jaipur", "Lucknow"): {"score": 9, "distance": 628, "hours": 14},
            ("Jaipur", "Kanpur"): {"score": 9, "distance": 512, "hours": 12},
            ("Jaipur", "Dehradun"): {"score": 10, "distance": 760, "hours": 16},
            ("Jaipur", "Varanasi"): {"score": 11, "distance": 836, "hours": 17},
            ("Jaipur", "Agra"): {"score": 5, "distance": 513, "hours": 12},
            ("Jaipur", "Gurugram"): {"score": 8, "distance": 250, "hours": 8},
            ("Lucknow", "Kanpur"): {"score": 4, "distance": 116, "hours": 4},
            ("Lucknow", "Dehradun"): {"score": 8, "distance": 804, "hours": 16},
            ("Lucknow", "Varanasi"): {"score": 6, "distance": 208, "hours": 7},
            ("Lucknow", "Agra"): {"score": 7, "distance": 323, "hours": 9},
            ("Lucknow", "Gurugram"): {"score": 9, "distance": 586, "hours": 13},
            ("Kanpur", "Dehradun"): {"score": 9, "distance": 688, "hours": 15},
            ("Kanpur", "Varanasi"): {"score": 5, "distance": 324, "hours": 9},
            ("Kanpur", "Agra"): {"score": 7, "distance": 207, "hours": 7},
            ("Kanpur", "Gurugram"): {"score": 9, "distance": 470, "hours": 11},
            ("Dehradun", "Varanasi"): {"score": 10, "distance": 1012, "hours": 20},
            ("Dehradun", "Agra"): {"score": 8, "distance": 481, "hours": 11},
            ("Dehradun", "Gurugram"): {"score": 7, "distance": 278, "hours": 8},
            ("Varanasi", "Agra"): {"score": 11, "distance": 531, "hours": 12},
            ("Varanasi", "Gurugram"): {"score": 12, "distance": 794, "hours": 16},
            ("Agra", "Gurugram"): {"score": 5, "distance": 263, "hours": 8},
        }
        
        for (origin_name, dest_name), data in route_data.items():
            if origin_name in stations and dest_name in stations:
                route, created = RouteComplexity.objects.get_or_create(
                    origin=stations[origin_name],
                    destination=stations[dest_name],
                    defaults={
                        "complexity_score": data["score"],
                        "distance_km": data["distance"],
                        "estimated_hours": data["hours"]
                    }
                )
                if created:
                    self.stdout.write(f'  Created route: {origin_name} → {dest_name}')
                else:
                    self.stdout.write(f'  Route already exists: {origin_name} → {dest_name}')