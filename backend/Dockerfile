FROM python:3.10-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Force install Postgres adapter and Production Server
RUN pip install psycopg2-binary gunicorn

COPY . .

# Collect static files for Django Admin
RUN python manage.py collectstatic --noinput

# Run the app via Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]