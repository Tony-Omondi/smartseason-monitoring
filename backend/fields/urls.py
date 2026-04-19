from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FieldViewSet, dashboard_stats

router = DefaultRouter()
router.register(r'fields', FieldViewSet, basename='field')

urlpatterns = [
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('', include(router.urls)),
]