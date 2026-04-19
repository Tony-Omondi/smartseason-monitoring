from rest_framework import serializers
from .models import Field, FieldUpdate

class FieldUpdateSerializer(serializers.ModelSerializer):
    agent_name = serializers.ReadOnlyField(source='agent.username')

    class Meta:
        model = FieldUpdate
        fields = ['id', 'notes', 'is_flagged', 'agent_name', 'created_at']
        read_only_fields = ['agent']

class FieldSerializer(serializers.ModelSerializer):
    computed_status = serializers.ReadOnlyField() # Pulls from our @property
    updates = FieldUpdateSerializer(many=True, read_only=True)
    assigned_agent_name = serializers.ReadOnlyField(source='assigned_agent.username')

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage', 
            'assigned_agent', 'assigned_agent_name', 'computed_status', 'updates'
        ]