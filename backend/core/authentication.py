from django.contrib.auth.backends import BaseBackend
from .models import RailwayWorker

class RailwayWorkerBackend(BaseBackend):
    def authenticate(self, request, govt_id=None, name=None, role=None):
        try:
            employee = RailwayWorker.objects.get(govt_id=govt_id, name=name, role=role)
            return employee
        except RailwayWorker.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return RailwayWorker.objects.get(pk=user_id)
        except RailwayWorker.DoesNotExist:
            return None

