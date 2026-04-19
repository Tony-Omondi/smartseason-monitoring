from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView

urlpatterns = [
    # This is the endpoint React will hit to log in
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # React uses this to keep the user logged in without re-typing passwords
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]