from . import views
from django.urls import path
from .views import EmployeeTokenLoginView, RailwayWorkerListView, RailwayWorkerDetailView, EmployeeProfileView

urlpatterns = [
    path('token-login/', EmployeeTokenLoginView.as_view(), name='token_login'),
    path('profile/', EmployeeProfileView.as_view(), name='employee_profile'),
    path('workers/', RailwayWorkerListView.as_view(), name='worker_list'),
    path('workers/<str:govt_id>/',
         RailwayWorkerDetailView.as_view(), name='worker_detail'),
]

app_name = "core"

urlpatterns = [
    path("workers/", views.RailwayWorkerListView.as_view(), name="worker-list"),
    path("workers/<str:govt_id>/",
         views.RailwayWorkerDetailView.as_view(), name="worker-detail"),
]
