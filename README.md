# SmartSeason Field Monitoring System

A full-stack web application designed to track crop progress across multiple fields during a growing season. Built as a technical assessment for the Software Engineer Intern position.

## 🚀 Live Demo
* **Live Deployment Link:** [Link will go here]
* **Demo Admin Credentials:** `admin` / `password123`
* **Demo Agent Credentials:** `agent1` / `password123`

## 🛠️ Tech Stack
* **Backend:** Django & Django REST Framework
* **Frontend:** React + Vite + Tailwind CSS
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose

## 🏗️ Design Decisions & Architecture
* **Separation of Concerns:** The backend is split into two isolated Django apps: `users` (handling role-based authentication via JWT) and `fields` (handling core business logic and crop tracking).
* **Computed Status Logic:** The field status (Active, At Risk, Completed) is calculated dynamically using a Django `@property` based on the planting date and recent field updates, rather than storing a hardcoded state that requires manual syncing.

## 🤔 Assumptions Made
* *[We will fill this in as we encounter edge cases, e.g., assuming a standard crop cycle is 90 days for the 'At Risk' calculation]*

## 💻 Local Setup Instructions

### Prerequisites
* Docker and Docker Compose installed on your machine.

### Running the Application
1. Clone the repository:
   ```bash
   git clone https://github.com/Tony-Omondi/smartseason-monitoring.git
   cd smartseason-monitoring