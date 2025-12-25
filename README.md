# 🚂 Rail Sanchaalak — Next-Gen Intelligent Railway Operations Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Django](https://img.shields.io/badge/Django-5.2-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**Rail Sanchaalak** is a state-of-the-art **Railway Logistics & Operations System** designed to digitize and optimize the complex workflow of freight management. By leveraging **Artificial Intelligence (AI)** for delay prediction and **Google OR-Tools** for constraint-based scheduling, Rail Sanchaalak empowers railway zones to maximize track utilization and minimize operational bottlenecks.

The platform bridges the gap between **Station Masters**, **Section Controllers**, **Freight Operators**, and **Track Managers** through a unified, role-based dashboard system.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [AI & Optimization Modules](#-ai--optimization-modules)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Team & Contributors](#-team--contributors)
- [License](#-license)

---

## 🚀 Key Features

### 📦 End-to-End Freight Management
- **Smart Booking System**: Operators can book bulk consignments (Coal, Steel, Petroleum) with specific wagon requirements.
- **Dynamic Pricing Engine**: Calculates costs based on distance, commodity type, and route complexity score (1-20).
- **Lifecycle Tracking**: Full visibility into freight status:
  - `Scheduled` ➝ `Loading` ➝ `In Transit` ➝ `Unloading` ➝ `Completed`.

### 🧠 Predictive AI & Analytics
- **Delay Prediction**: Machine Learning models analyze historical data (weather patterns, track maintenance logs, signal failures) to predict arrival delays.
- **Demand Forecasting**: Predicts wagon demand for specific regions using seasonal trend analysis.
- **Route Optimization**: Suggests the most efficient path based on track gradients and congestion levels.

### 🗓️ Algorithmic Scheduling
- **Conflict-Free Timetables**: Uses **Google OR-Tools (CP-SAT)** to generate schedules that strictly adhere to track capacity and safety constraints.
- **Automated Conflict Detection**: Identifies platform clashes or track unavailability before they occur.

### 👥 Role-Based Access Control (RBAC)
- **Station Master**: Manage platform allocation and live signal updates.
- **Section Controller**: Approve schedules and handle emergency maintenance blocks.
- **Freight Operator**: Commercial dashboard for bookings and financial reports.
- **Track Manager**: Log defects, schedule repairs, and update track health status.

---

## 🏗️ System Architecture & Structure

The application follows a **Monolithic Service-Oriented Architecture** with a clear separation between the Django backend and React frontend.

```text
rail-sanchaalak/
├── backend/                        # Django Backend
│   ├── booking/                    # Freight booking business logic
│   │   ├── ml_models/              # Trained ML models (.pkl files)
│   │   └── management/commands/    # Scripts (populate_booking_data.py)
│   ├── core/                       # Auth, Users, Base Models (Station, Train)
│   ├── decision_engine/            # AI Logic for conflict resolution
│   ├── ml/                         # Core Delay Prediction Engine
│   ├── scheduler/                  # Google OR-Tools Optimization Engine
│   ├── datasets/                   # CSV Data for seeding (Stations, Routes)
│   └── manage.py                   # Django Entry Point
│
└── frontend/                       # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── dashboards/         # Role-specific views
    │   │   └── ui/                 # Shadcn UI Components
    │   ├── lib/                    # API Utilities (Axios, Interceptors)
    │   └── App.tsx                 # Main Router & Layout
    └── vite.config.ts              # Vite Build Config
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18** | UI Library |
| | **Vite** | Build Tool (Fast HMR) |
| | **Tailwind CSS** | Utility-first styling |
| | **Shadcn UI** | Accessible component primitives |
| | **Recharts** | Data visualization charts |
| **Backend** | **Python 3.10+** | Core Language |
| | **Django 5.2** | Web Framework |
| | **Django REST Framework** | API Toolkit |
| | **SimpleJWT** | Authentication |
| **Data & ML** | **PostgreSQL** | Primary Database |
| | **Google OR-Tools** | Constraint Programming / Scheduling |
| | **Scikit-Learn** | Machine Learning Models (Random Forest) |
| | **Pandas / NumPy** | Data Manipulation |

---

## 🧠 AI & Optimization Modules

### 1. Delay Prediction Model
Located in `backend/ml/`, this module uses a **Random Forest Regressor**.
- **Inputs**: `Distance`, `Rain_Intensity`, `Fog_Level`, `Track_Condition_Index`, `Traffic_Volume`.
- **Output**: Predicted delay in minutes.

### 2. Constraint Programming Scheduler
Located in `backend/scheduler/`, this module uses **CP-SAT**.
- **Constraints**: 
  - No two trains on the same track segment at the same time.
  - Minimum headway time between trains.
  - Station platform capacity limits.
- **Objective**: Minimize total travel time + total wait time.

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** v3.10+
- **PostgreSQL** v14+

### Backend Setup

1.  **Clone and Navigate**
    ```bash
    git clone [https://github.com/your-repo/rail-sanchaalak.git](https://github.com/your-repo/rail-sanchaalak.git)
    cd rail-sanchaalak/backend
    ```

2.  **Virtual Environment**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database & Migrations**
    Ensure PostgreSQL is running. Create a DB named `rail_sanchaalak_db`.
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5.  **Seed Data**
    Load the initial dataset for stations, trains, and tracks.
    ```bash
    python manage.py populate_booking_data
    python manage.py import_station
    python manage.py import_train
    python manage.py import_track
    ```

6.  **Run Server**
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1.  **Navigate**
    ```bash
    cd ../frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Dev Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

---

## 🔧 Environment Configuration

Create a `.env` file in the `backend/` root directory:

```env
# Database Config
DB_NAME=rail_sanchaalak_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# Security
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True

# ML Models Path
MODEL_PATH=backend/ml/saved_models/
```

---

## 🔌 API Reference

### Authentication
- `POST /api/core/login/` - Obtain Access & Refresh Tokens.
- `POST /api/core/refresh/` - Refresh Access Token.

### Booking Operations
- `GET /api/booking/freights/` - List all bookings.
- `POST /api/booking/book/` - Create a new booking.
  - **Body**: `{"material": "Coal", "quantity": 500, "source": "NDLS", "dest": "HWH"}`
- `GET /api/booking/track/{id}/` - Track specific booking status.

### AI Services
- `POST /api/predict-delay/` - Get delay prediction.
- `POST /api/scheduler/optimize/` - Trigger schedule optimization.

---

## 👥 Team & Contributors

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Navistha Pandey** | **Project Manager & Backend** | **Backend API Lead.** Managed project timeline, developed core Booking & Station APIs, and oversaw system integration. |
| **Nehal Ajmal** | **Core Backend & ML** | **Lead Architect.** Designed the core backend logic, implemented Google OR-Tools for scheduling, and developed the ML concepts. |
| **Mridul Bajpai** | **Backend (ML)** | **Data Scientist.** Focused specifically on freight delay prediction models, data cleaning, and accuracy tuning. |
| **Mohammad Zeeshan** | **Full Stack** | **Integration Specialist.** Connected the Django backend with React frontend and ensured seamless data flow. |
| **Anjali Shukla** | **Frontend** | **UI Developer.** Built the core dashboard interfaces, implemented Shadcn UI components, and handled user interactions. |
| **Anshuman Sharma** | **Frontend** | **UI Developer.** Developed the visualization charts, responsive layouts, and role-specific views. |

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

© 2025 **Rail Sanchaalak Team**. Built with ❤️ for the Railway Industry.