# Taskarra

A team task management web app where users can create projects, assign tasks, and track progress with role-based access control.

## Live Demo
- **Frontend:** https://taskarra.vercel.app/login
- **Backend API:** https://taskarra-api.onrender.com

## Features
- Signup and Login with JWT authentication
- Role-based access control (Admin and Member)
- Admins can create projects and manage team members
- Create tasks with priority, due date, and status
- Assign tasks to team members
- Dashboard showing total, todo, in-progress, done and overdue tasks
- Overdue tasks highlighted automatically
- Fully responsive UI

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Axios
- React Hot Toast

**Backend**
- Node.js
- Express.js
- better-sqlite3 (SQLite)
- JWT (jsonwebtoken)
- bcryptjs

## Project Structure
taskarra/
├── client/          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   └── NewProject.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api.js
│   │   └── App.jsx
└── server/          # Node.js backend
└── src/
├── routes/
│   ├── auth.js
│   ├── projects.js
│   └── tasks.js
├── middleware/
│   └── auth.js
├── db/
│   └── database.js
└── index.js
## How to Run Locally

**Clone the repo**
```bash
git clone https://github.com/riya-aggarwal31072003/taskarra.git
cd taskarra
```

**Run Backend**
```bash
cd server
npm install
npm run dev
```

**Run Frontend**
```bash
cd client
npm install
npm run dev
```

**Open browser**
http://localhost:5173

## Environment Variables

**Backend (server/.env)**
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development

**Frontend (client/.env)**
VITE_API_URL=http://localhost:5000/api

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/projects | Get all projects | Yes |
| POST | /api/projects | Create project | Admin |
| POST | /api/projects/:id/members | Add member | Admin |
| GET | /api/tasks/project/:id | Get project tasks | Yes |
| POST | /api/tasks | Create task | Yes |
| PUT | /api/tasks/:id | Update task | Yes |
| DELETE | /api/tasks/:id | Delete task | Yes |
| GET | /api/tasks/dashboard | Get dashboard stats | Yes |

## Deployment
- Frontend deployed on **Vercel**
- Backend deployed on **Render**

## Author
**Riya Aggarwal**
- GitHub: https://github.com/riya-aggarwal31072003
- LinkedIn: https://www.linkedin.com/in/riya-aggarwal-28429b260/
