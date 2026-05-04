# ProjectFlow 🚀

A full-stack project management tool built with **Django REST Framework** (backend) and **React + TypeScript** (frontend). Features JWT authentication, project/task CRUD, filtering, pagination, and a polished dark-themed UI.

---

## ✨ Feature List

### Authentication
- Register with email, password, first & last name
- Login with JWT (access + refresh tokens)
- Auto token refresh via Axios interceptor
- Secure logout (token blacklisting)
- bcrypt password hashing via Django's `AbstractBaseUser`

### Projects
- Create, read, update, delete projects
- Fields: title, description, status (`active` / `completed`)
- Paginated list (10 per page)
- Search by title / description
- Filter by status
- Task progress bar per project

### Tasks
- Full CRUD attached to a project
- Fields: title, description, status (`todo` / `in-progress` / `done`), due date
- Filter tasks by status (tab UI)
- Inline status cycling (click checkbox to advance)
- Overdue indicator for past-due tasks

### Bonus Features Implemented
- ✅ Redux Toolkit state management (auth, projects, tasks slices)
- ✅ React Hook Form + Yup validation on all forms
- ✅ Pagination & search on projects dashboard
- ✅ Unit tests — Jest for frontend (components + slices), Django test client for backend
- ✅ Docker support (docker-compose with PostgreSQL)
- ✅ TypeScript throughout the frontend (strict mode)
- ✅ Database seeder command

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL (default) or SQLite (dev fallback) |
| Frontend | React 18, TypeScript 5, React Router 6 |
| State | Redux Toolkit |
| Forms | React Hook Form + Yup |
| Styling | Custom CSS Modules (dark design system) |
| Tests | Django TestCase (backend), Jest + RTL (frontend) |
| DevOps | Docker, docker-compose |

---

## 📁 Project Structure

```
projectflow/
├── backend/
│   ├── projectflow/          # Django project config
│   │   ├── settings.py
│   │   └── urls.py
│   ├── apps/
│   │   ├── users/            # Custom user model, auth views
│   │   ├── projects/         # Project model + CRUD API
│   │   └── tasks/            # Task model + CRUD API
│   ├── tests/
│   │   └── test_api.py       # Backend integration tests
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar layout
│   │   │   ├── projects/     # ProjectCard, ProjectFormModal
│   │   │   └── tasks/        # TaskItem, TaskFormModal
│   │   ├── pages/            # LoginPage, RegisterPage, DashboardPage, ProjectDetailPage
│   │   ├── store/            # Redux slices + store
│   │   ├── services/         # Axios API clients
│   │   ├── hooks/            # useAppDispatch, useAppSelector
│   │   ├── types/            # TypeScript interfaces
│   │   └── tests/            # Jest unit tests
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
└── docker-compose.yml
```

---

## 🚀 Setup — Option A: Local Development (Recommended for dev)

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) PostgreSQL — SQLite works out of the box

---

### Backend Setup

```bash
# 1. Navigate to backend
cd projectflow/backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY, and optionally switch DB_ENGINE to postgresql

# 5. Run migrations
python manage.py migrate

# 6. Seed the database (see Seeders section)
python manage.py seed

# 7. Start the development server
python manage.py runserver
# API now available at http://localhost:8000
```

#### Using PostgreSQL instead of SQLite

In `.env`:
```
DB_ENGINE=postgresql
DB_NAME=projectflow
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

Create the database first:
```bash
createdb projectflow   # or use psql / pgAdmin
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend (new terminal)
cd projectflow/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Default: REACT_APP_API_URL=http://localhost:8000/api

# 4. Start the React dev server
npm start
# App now available at http://localhost:3000
```

---

## 🐳 Setup — Option B: Docker (One Command)

### Prerequisites
- Docker Desktop installed and running

```bash
# From the projectflow/ root directory:
docker-compose up --build
```

This will:
1. Start a PostgreSQL 15 database
2. Run Django migrations automatically
3. Seed the database with sample data
4. Start the Django API at **http://localhost:8000**
5. Start the React app at **http://localhost:3000**

To stop:
```bash
docker-compose down

# To also remove the database volume:
docker-compose down -v
```

---

## 🌱 Running Seeders

The seeder creates 2 demo users and sample projects/tasks:

```bash
# Make sure you are in the backend directory with venv active
python manage.py seed
```

**Demo credentials after seeding:**

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | Password123! | User with 3 projects |
| bob@example.com | Password123! | Empty account |

The seeder is idempotent — running it multiple times won't duplicate data.

---

## 🧪 Running Tests

### Backend Tests

```bash
cd projectflow/backend
source venv/bin/activate
python manage.py test tests
```

Backend test coverage includes:
- User registration (success + password mismatch)
- Login (valid + invalid credentials)
- Project CRUD (create, list own, update, delete)
- Project search and status filtering
- Task CRUD
- Task status filtering
- Authorization (users can only access their own data)
- Unauthenticated access returns 401

### Frontend Tests

```bash
cd projectflow/frontend
npm test
# Or for CI (no watch mode):
npm test -- --watchAll=false
```

Frontend test coverage includes:
- `ProjectCard` renders correctly (title, badge, progress, empty state)
- `TaskItem` renders correctly (title, status badge, due date)
- `authSlice` reducer (login, logout, register, clearError)
- `projectsSlice` reducer (fetch, create, update, delete)
- `tasksSlice` reducer (fetch, create, update, delete)

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login (returns JWT) | No |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| POST | `/api/auth/logout/` | Logout (blacklist refresh token) | Yes |
| GET/PATCH | `/api/auth/profile/` | Get or update profile | Yes |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/` | List own projects (paginated) |
| POST | `/api/projects/` | Create project |
| GET | `/api/projects/{id}/` | Get project detail |
| PATCH | `/api/projects/{id}/` | Update project |
| DELETE | `/api/projects/{id}/` | Delete project |

**Query params:** `?search=keyword`, `?status=active`, `?page=2`, `?ordering=-created_at`

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/` | List tasks (filtered to own projects) |
| POST | `/api/tasks/` | Create task |
| GET | `/api/tasks/{id}/` | Get task detail |
| PATCH | `/api/tasks/{id}/` | Update task |
| DELETE | `/api/tasks/{id}/` | Delete task |

**Query params:** `?project={id}`, `?status=todo`, `?search=keyword`

---

## ⚠️ Known Limitations

1. **No email verification** — users are activated immediately on registration
2. **No file attachments** — tasks/projects support text only
3. **No real-time updates** — requires page refresh to see changes made by other sessions
4. **No team/collaboration** — projects are per-user only (no sharing)
5. **No role-based access** — all authenticated users have equal access to their own data
6. **SQLite limitations** — not recommended for production; use PostgreSQL
7. **Frontend build** — the Docker frontend uses `npm start` (dev server), not an optimized build

---

## 🌐 Deployment Notes (Optional)

### Backend → Render / Railway
- Set `DEBUG=False`, `DB_ENGINE=postgresql`, `ALLOWED_HOSTS=yourdomain.com`
- Run `python manage.py collectstatic` and serve with `gunicorn projectflow.wsgi`

### Frontend → Vercel / Netlify
- Set `REACT_APP_API_URL=https://your-backend.onrender.com/api`
- Run `npm run build` and deploy the `build/` folder

---

## 📄 License

MIT — free to use and modify.
