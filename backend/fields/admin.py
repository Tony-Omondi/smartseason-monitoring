from django.contrib import admin
from .models import Field, FieldUpdate

class FieldUpdateInline(admin.TabularInline):
    model = FieldUpdate
    extra = 1

@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'current_stage', 'assigned_agent', 'computed_status')
    list_filter = ('current_stage', 'assigned_agent')
    inlines = [FieldUpdateInline]

@admin.register(FieldUpdate)
class FieldUpdateAdmin(admin.ModelAdmin):
    list_display = ('field', 'agent', 'is_flagged', 'created_at')