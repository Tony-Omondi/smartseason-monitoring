from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin (Coordinator)'),
        ('AGENT', 'Field Agent'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='AGENT')

    def __str__(self):
        return f"{self.username} - {self.role}"