from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Field, FieldUpdate
from .serializers import FieldSerializer, FieldUpdateSerializer

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Security check: Admins see all fields. Agents only see their assigned fields.
        """
        user = self.request.user
        if user.role == 'ADMIN':
            return Field.objects.all()
        return Field.objects.filter(assigned_agent=user)

    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """
        Custom endpoint for Agents to update stage and add notes simultaneously.
        """
        field = self.get_object()
        new_stage = request.data.get('current_stage')
        notes = request.data.get('notes')
        is_flagged = request.data.get('is_flagged', False)

        # Update the field's stage if provided
        if new_stage:
            field.current_stage = new_stage
            field.save()

        # Create the log entry
        if notes:
            FieldUpdate.objects.create(
                field=field,
                agent=request.user,
                notes=notes,
                is_flagged=is_flagged
            )
            
        return Response({'status': 'Update recorded successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns the numbers for the React dashboard.
    """
    user = request.user
    if user.role == 'ADMIN':
        fields = Field.objects.all()
    else:
        fields = Field.objects.filter(assigned_agent=user)

    # We calculate the status in Python since 'computed_status' is a property, not a DB column
    active_count = 0
    at_risk_count = 0
    completed_count = 0

    for field in fields:
        if field.computed_status == 'Active':
            active_count += 1
        elif field.computed_status == 'At Risk':
            at_risk_count += 1
        elif field.computed_status == 'Completed':
            completed_count += 1

    data = {
        'total_fields': fields.count(),
        'status_breakdown': {
            'active': active_count,
            'at_risk': at_risk_count,
            'completed': completed_count
        }
    }
    return Response(data)