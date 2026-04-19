from django.db import models
from django.conf import settings
from datetime import date

class Field(models.Model):
    STAGE_CHOICES = [
        ('PLANTED', 'Planted'),
        ('GROWING', 'Growing'),
        ('READY', 'Ready'),
        ('HARVESTED', 'Harvested'),
    ]

    name = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='PLANTED')
    
    # Best practice: use settings.AUTH_USER_MODEL instead of importing the User model directly
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_fields'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def computed_status(self):
        """
        The core business logic required by the assessment.
        Calculates Active, At Risk, or Completed dynamically.
        """
        if self.current_stage == 'HARVESTED':
            return 'Completed'
        
        # At Risk Condition 1: Been in the ground for over 30 days but hasn't moved to 'Growing'
        days_since_planting = (date.today() - self.planting_date).days
        if self.current_stage == 'PLANTED' and days_since_planting > 30:
            return 'At Risk'
            
        # At Risk Condition 2: Check if the agent flagged an issue in their latest note
        latest_update = self.updates.order_by('-created_at').first()
        if latest_update and latest_update.is_flagged:
            return 'At Risk'

        # Default state
        return 'Active'

    def __str__(self):
        return f"{self.name} ({self.crop_type}) - {self.computed_status}"


class FieldUpdate(models.Model):
    """
    Tracks the history of notes and stage changes made by Field Agents.
    """
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)
    
    # Adding a flag lets agents indicate if a crop is failing (triggers 'At Risk' status above)
    is_flagged = models.BooleanField(default=False, help_text="Check if there is a critical issue (e.g., pests, drought)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update on {self.field.name} by {self.agent.username}"