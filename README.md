# SmartSeason Field Monitoring System

A full-stack web application designed to track crop progress across multiple fields during a growing season. Built as a technical assessment for the Software Engineer Intern position at Shamba Records.

## 🚀 Live Demo
* **Live Deployment Link:** [Link will go here once deployed]
* **Demo Admin Credentials:** `admin` / `password123`
* **Demo Agent Credentials:** `agent1` / `password123`

## 🛠️ Tech Stack
* **Backend:** Django & Django REST Framework (Python 3.12)
* **Frontend:** React + Vite + Tailwind CSS
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

## 🏗️ Design Decisions & Architecture
* **No Public Registration (Internal Tooling):** Because this is an internal enterprise tool, public user registration is intentionally omitted to prioritize system security and avoid over-engineering. Field Agent accounts are strictly provisioned by Admins (Coordinators) via the backend.
* **Separation of Concerns:** The backend is split into two isolated Django apps: `users` (handling role-based JWT authentication) and `fields` (handling core business logic and crop tracking).
* **Computed Status Logic:** The field status (Active, At Risk, Completed) is calculated dynamically using a Django `@property` based on the planting date and recent field updates. This prevents stale data and eliminates the need to manually sync state across different database tables.

## 🤔 Assumptions Made
* **The "At Risk" Logic:** I assumed two primary conditions that would flag a crop as "At Risk": 
  1. The field has been in the initial `PLANTED` stage for over 30 days without progressing to `GROWING`.
  2. A Field Agent explicitly flags a critical issue (e.g., pests, drought) in their latest field update log.
* **Role Access:** I assumed Field Agents only need visibility into the specific fields assigned to them, while Admins require a global view of all fields across the system.

## 💻 Local Setup Instructions

### Prerequisites
* Docker and Docker Compose installed on your machine.

### Running the Application (Docker)
1. Clone the repository:
   ```bash
   git clone [https://github.com/Tony-Omondi/smartseason-monitoring.git](https://github.com/Tony-Omondi/smartseason-monitoring.git)
   cd smartseason-monitoring