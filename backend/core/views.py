from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def employee_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        work_id = data.get("work_id")
        password = data.get("password")

        user = authenticate(request, work_id=work_id, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                "message": "Login successful",
                "employee": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role,
                }
            })
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=400)

    return JsonResponse({"error": "POST request required"}, status=405)
