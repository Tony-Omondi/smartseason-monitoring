"""
Run this after migrations to create demo users and sample fields:

    python manage.py shell < seed_data.py

Or copy into a management command.
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from fields.models import Field, FieldUpdate
from datetime import date, timedelta

User = get_user_model()

print("Seeding demo data...")

# ── Users ──────────────────────────────────────────────────────────────────
admin = User.objects.filter(username='admin').first()
if not admin:
    admin = User.objects.create_superuser('admin', 'admin@smartseason.com', 'admin123')
    admin.role = 'ADMIN'
    admin.save()
    print("  Created admin / admin123")

alice = User.objects.filter(username='alice').first()
if not alice:
    alice = User.objects.create_user('alice', 'alice@smartseason.com', 'agent123', role='AGENT')
    print("  Created alice / agent123")

bob = User.objects.filter(username='bob').first()
if not bob:
    bob = User.objects.create_user('bob', 'bob@smartseason.com', 'agent123', role='AGENT')
    print("  Created bob / agent123")

# ── Fields ─────────────────────────────────────────────────────────────────
fields_data = [
    dict(name="North Paddock A", crop_type="Maize",  planting_date=date.today()-timedelta(days=45), current_stage="GROWING",   assigned_agent=alice),
    dict(name="South Block 2",   crop_type="Wheat",  planting_date=date.today()-timedelta(days=90), current_stage="READY",     assigned_agent=alice),
    dict(name="East Ridge",      crop_type="Barley", planting_date=date.today()-timedelta(days=20), current_stage="PLANTED",   assigned_agent=alice),
    dict(name="West Quarter",    crop_type="Soy",    planting_date=date.today()-timedelta(days=120),current_stage="HARVESTED", assigned_agent=bob),
    dict(name="Hillside Plot",   crop_type="Maize",  planting_date=date.today()-timedelta(days=35), current_stage="PLANTED",   assigned_agent=bob),
    dict(name="River Flat",      crop_type="Canola", planting_date=date.today()-timedelta(days=60), current_stage="GROWING",   assigned_agent=bob),
]

for fd in fields_data:
    f, created = Field.objects.get_or_create(name=fd['name'], defaults=fd)
    if created:
        print(f"  Created field: {f.name}")

# ── Sample updates ─────────────────────────────────────────────────────────
n_paddock = Field.objects.filter(name="North Paddock A").first()
if n_paddock and not n_paddock.updates.exists():
    FieldUpdate.objects.create(field=n_paddock, agent=alice, notes="Germination looks strong. Soil moisture adequate after last week's rain.")
    FieldUpdate.objects.create(field=n_paddock, agent=alice, notes="Spotted early signs of aphids on lower leaves. Monitoring closely.", is_flagged=True)
    print("  Added updates to North Paddock A")

south = Field.objects.filter(name="South Block 2").first()
if south and not south.updates.exists():
    FieldUpdate.objects.create(field=south, agent=alice, notes="Crop looks excellent. Heads filling nicely, ready for harvest assessment.")
    print("  Added updates to South Block 2")

hillside = Field.objects.filter(name="Hillside Plot").first()
if hillside and not hillside.updates.exists():
    FieldUpdate.objects.create(field=hillside, agent=bob, notes="Seeds planted. Irrigation set. Waiting on germination.")
    print("  Added updates to Hillside Plot")

print("\nDone! Demo credentials:")
print("  Admin:  admin / admin123")
print("  Agent:  alice / agent123")
print("  Agent:  bob   / agent123")