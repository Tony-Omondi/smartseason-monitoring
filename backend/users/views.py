from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


# ── Auth ───────────────────────────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Override the default login view to use our custom serializer,
    which adds `username` and `role` to the JWT response body.
    The frontend uses `role` to redirect to the correct dashboard.
    """
    serializer_class = CustomTokenObtainPairSerializer


# ── Permissions ────────────────────────────────────────────────────────────

class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users with role == 'ADMIN'.
    Used instead of Django's built-in is_staff to keep role
    logic consistent with our own User model.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


# ── User management ────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    Admin-only CRUD for users.

    GET    /api/users/       → list all users
    POST   /api/users/       → create a new user
    GET    /api/users/{id}/  → retrieve a user
    PATCH  /api/users/{id}/  → update a user
    DELETE /api/users/{id}/  → delete a user
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all().order_by('date_joined')

    def create(self, request, *args, **kwargs):
        """
        Override create so we use create_user() instead of save(),
        ensuring the password is properly hashed and not stored in plaintext.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data.get('email', ''),
            password=request.data.get('password'),
            role=serializer.validated_data.get('role', 'AGENT'),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)