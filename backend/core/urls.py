from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Route all authentication requests to the users app
    path('api/auth/', include('users.urls')),
]