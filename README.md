# SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built with Django REST Framework (backend) and React + Vite (frontend).

---

## Demo Credentials

| Role              | Username | Password   |
|-------------------|----------|------------|
| Admin/Coordinator | `admin`  | `admin123` |
| Field Agent       | `alice`  | `agent123` |
| Field Agent       | `bob`    | `agent123` |

---

## Project Structure

```
smartseason/
├── backend/
│   ├── core/               # Django project (settings, urls)
│   ├── users/              # Custom User model, auth views
│   ├── fields/             # Field + FieldUpdate models, API views
│   ├── requirements.txt
│   ├── seed_data.py        # Creates demo users + sample fields
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── api/client.js           # Axios instance + JWT interceptors
    │   ├── context/AuthContext.jsx # Global auth state
    │   ├── components/
    │   │   ├── Layout.jsx          # Sidebar navigation
    │   │   └── ProtectedRoute.jsx  # Role-based route guard
    │   └── pages/
    │       ├── Login.jsx
    │       ├── admin/
    │       │   ├── Dashboard.jsx   # Overview + at-risk alerts
    │       │   ├── Fields.jsx      # Full CRUD + filters + detail drawer
    │       │   └── Users.jsx       # Team management
    │       └── agent/
    │           ├── Dashboard.jsx   # Personal field overview
    │           ├── MyFields.jsx    # Field cards with status
    │           └── FieldDetail.jsx # Stage progress + update logging
    ├── package.json
    └── vite.config.js
```

---

## Setup Instructions

### Backend

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Seed demo data (creates users + sample fields)
python seed_data.py

# 5. Start the server
python manage.py runserver
# → API available at http://localhost:8000/api/
```

### Frontend

```bash
# From the frontend/ directory:
npm install
npm run dev
# → App available at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint                        | Access        | Description                          |
|--------|---------------------------------|---------------|--------------------------------------|
| POST   | `/api/auth/login/`              | Public        | JWT login — returns access + refresh |
| POST   | `/api/auth/token/refresh/`      | Public        | Refresh an expired access token      |
| GET    | `/api/fields/`                  | Auth          | List fields (admin: all, agent: own) |
| POST   | `/api/fields/`                  | Admin         | Create a field                       |
| GET    | `/api/fields/{id}/`             | Auth          | Retrieve a field with update history |
| PATCH  | `/api/fields/{id}/`             | Admin         | Edit field details                   |
| DELETE | `/api/fields/{id}/`             | Admin         | Delete a field                       |
| POST   | `/api/fields/{id}/add_update/`  | Agent         | Log a stage update + notes           |
| GET    | `/api/dashboard-stats/`         | Auth          | Status breakdown counts              |
| GET    | `/api/users/`                   | Admin         | List all users                       |
| POST   | `/api/users/`                   | Admin         | Create a new user                    |

---

## Design Decisions

### Authentication
JWT via `djangorestframework-simplejwt`. The custom `TokenObtainPairSerializer` includes the user's `role` in the login response so the React app can immediately redirect to the correct dashboard without a second API call. The frontend stores `access_token` and `refresh_token` in `localStorage` and automatically attempts a token refresh on 401 before logging the user out.

### Role-Based Access
Two roles: `ADMIN` (Coordinator) and `AGENT` (Field Agent).

- `get_queryset` on `FieldViewSet` enforces data isolation at the query level — agents receive only their assigned fields, never all fields.
- The `UserViewSet` uses a custom `IsAdminUser` permission class rather than Django's built-in `is_staff`, keeping role logic consistent with the application's own role model.
- The frontend uses `ProtectedRoute` components that check both authentication and role, preventing agents from accessing admin routes client-side.

### Field Status Logic (`computed_status`)

Status is a `@property` on the `Field` model — computed on read, not stored in the database. This avoids stale status and keeps the logic in one place.

Three rules, evaluated in order:

1. **Completed** — `current_stage == 'HARVESTED'`
2. **At Risk** — either:
   - The field has been planted for more than 30 days but hasn't advanced past `PLANTED` (suggests a germination or establishment problem), **or**
   - The agent's most recent update has `is_flagged = True` (agent-reported critical issue)
3. **Active** — everything else

The `is_flagged` mechanism gives agents a first-class way to escalate an issue to the admin's attention without needing a separate workflow. It shows up as an alert banner on both dashboards.

**Known trade-off:** `dashboard_stats` iterates all fields in Python to aggregate status counts because `computed_status` is a property rather than a database column. This is fine for the expected data volume but would need to be replaced with a `Case/When` annotation or a stored column for production scale.

### Data Model
`FieldUpdate` is an append-only log — updates are never edited or deleted. This gives admins a full audit trail of every observation an agent has made. The latest update's `is_flagged` value drives the `At Risk` status, so fixing the issue is as simple as logging a new unflagged update.

### Frontend Structure
React + Vite + React Router v6. No Redux — auth state is handled by a single `AuthContext` provider. API calls are centralised in `src/api/client.js` (an Axios instance with request/response interceptors), so no component imports `fetch` directly.

---

## Assumptions Made

- A field can only be assigned to one agent at a time (one-to-one assignment).
- Stage progression is forward-only in the agent update UI — agents can't move a field from `GROWING` back to `PLANTED`. Admins can set any stage directly when editing.
- Passwords are not validated for complexity in this assessment build (only Django's default validators apply). A production version would enforce stronger rules.
- No email sending — user creation is admin-only via the UI. In production, new agents would receive a welcome email with a password reset link.
- `SECRET_KEY` and `DEBUG` should be moved to environment variables before any deployment. See the note in `settings.py`.