from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import CustomTokenObtainPairView, UserViewSet
from fields.views import FieldViewSet, dashboard_stats


router = DefaultRouter()
router.register(r'fields', FieldViewSet, basename='field')
router.register(r'users',  UserViewSet,  basename='user')

urlpatterns = [
    # Django admin panel
    path('admin/', admin.site.urls),

    
    path('api/', include(router.urls)),

    # Auth: login → returns access + refresh tokens + role
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Auth: refresh → exchange refresh token for a new access token
    # Called automatically by the frontend Axios interceptor on 401 errors
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dashboard stats: returns total_fields + status_breakdown counts
    # Scoped by role (admin sees all, agent sees own fields)
    path('api/dashboard-stats/', dashboard_stats, name='dashboard_stats'),
]