#!/usr/bin/env python3
"""
Test script for Decision Engine API
Run this script to test the decision engine functionality
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/decision-center/api"

# Test data
TEST_USER = {
    "username": "test_controller",
    "password": "test_password"
}

def test_decision_endpoints():
    """Test main decision endpoints"""
    print("Testing Decision Engine API Endpoints...")
    print("=" * 50)
    
    # Test dashboard
    print("\n1. Testing Dashboard Endpoint")
    try:
        response = requests.get(f"{API_BASE}/dashboard/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Pending Decisions: {data.get('total_pending', 0)}")
            print(f"High Priority: {data.get('high_priority_pending', 0)}")
            print(f"Decisions Today: {data.get('decisions_today', 0)}")
            print(f"Active Conflicts: {data.get('active_conflicts', 0)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test decisions list
    print("\n2. Testing Decisions List")
    try:
        response = requests.get(f"{API_BASE}/decisions/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('results', []))} decisions")
            for decision in data.get('results', [])[:3]:  # Show first 3
                print(f"- {decision['title']} ({decision['priority']})")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test pending decisions
    print("\n3. Testing Pending Decisions")
    try:
        response = requests.get(f"{API_BASE}/decisions/pending/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Pending Decisions: {data.get('count', 0)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test engine status
    print("\n4. Testing Engine Status")
    try:
        response = requests.get(f"{API_BASE}/engine-status/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Engine Status: {data.get('status', 'unknown')}")
            print(f"AI Engine Active: {data.get('ai_engine_active', False)}")
            print(f"ML Models Loaded: {data.get('ml_models_loaded', False)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test AI recommendation
    print("\n5. Testing AI Recommendation Generation")
    try:
        test_scenario = {
            "scenario_type": "precedence",
            "trains_involved": ["12951", "12615"],
            "context_data": {
                "junction": "J-4",
                "passenger_count_12951": 1200,
                "passenger_count_12615": 800
            }
        }
        
        response = requests.post(
            f"{API_BASE}/ai-recommendation/",
            json=test_scenario,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Recommendation: {data.get('recommendation_text', 'N/A')}")
            print(f"Confidence: {data.get('confidence_score', 0)}%")
            print(f"Reasoning Points: {len(data.get('reasoning_points', []))}")
    except Exception as e:
        print(f"Error: {e}")

def show_api_documentation():
    """Show API endpoints documentation"""
    print("\nDecision Engine API Endpoints:")
    print("=" * 40)
    
    endpoints = [
        ("GET", "/decision-center/api/dashboard/", "Dashboard summary"),
        ("GET", "/decision-center/api/decisions/", "List all decisions"),
        ("GET", "/decision-center/api/decisions/pending/", "List pending decisions"),
        ("GET", "/decision-center/api/decisions/{id}/", "Get decision details"),
        ("POST", "/decision-center/api/decisions/{id}/accept_recommendation/", "Accept AI recommendation"),
        ("POST", "/decision-center/api/decisions/{id}/modify_recommendation/", "Modify AI recommendation"),
        ("POST", "/decision-center/api/decisions/{id}/override_recommendation/", "Override AI recommendation"),
        ("GET", "/decision-center/api/conflicts/", "List conflicts"),
        ("GET", "/decision-center/api/conflicts/active/", "List active conflicts"),
        ("GET", "/decision-center/api/analytics/", "Decision analytics"),
        ("GET", "/decision-center/api/engine-status/", "Engine status"),
        ("POST", "/decision-center/api/ai-recommendation/", "Generate AI recommendation"),
    ]
    
    for method, endpoint, description in endpoints:
        print(f"{method:6} {endpoint:50} - {description}")

if __name__ == "__main__":
    print("TrainTraffic Decision Engine API Test")
    print("=" * 40)
    
    # Show API documentation
    show_api_documentation()
    
    # Test endpoints (without authentication for now)
    test_decision_endpoints()
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("\nTo use the full API:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Create sample data: python manage.py generate_sample_decisions")
    print("3. Access admin: http://localhost:8000/admin/")
    print("4. Use API endpoints listed above")