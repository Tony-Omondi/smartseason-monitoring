from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Used for listing users and as the base for user creation.
    Password is write-only — never returned in responses.
    """
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT login response to include `username` and `role`.
    The frontend reads `role` on login to redirect to the correct dashboard
    without needing a second /me/ API call.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['role']     = self.user.role
        return data