import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get('/tasks/dashboard').then(r => setStats(r.data));
    API.get('/projects').then(r => setProjects(r.data));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <span className="nav-logo">Taskarra</span>
        <div className="nav-right">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="btn-sm">Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Dashboard</h2>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card total"><h3>{stats.total}</h3><p>Total Tasks</p></div>
            <div className="stat-card todo"><h3>{stats.todo}</h3><p>To Do</p></div>
            <div className="stat-card progress"><h3>{stats.inProgress}</h3><p>In Progress</p></div>
            <div className="stat-card done"><h3>{stats.done}</h3><p>Done</p></div>
            <div className="stat-card overdue"><h3>{stats.overdue}</h3><p>Overdue</p></div>
          </div>
        )}

        <div className="section-header">
          <h2>Projects</h2>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/projects/new')} className="btn-primary">
              + New Project
            </button>
          )}
        </div>

        <div className="project-grid">
          {projects.length === 0 && <p className="empty">No projects yet.</p>}
          {projects.map(p => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <h3>{p.name}</h3>
              <p>{p.description || 'No description'}</p>
            </div>
          ))}
        </div>
      </div>
{/* footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        marginTop: '3rem',
        borderTop: '1px solid #e5e7eb',
        color: '#9ca3af',
        fontSize: '0.85rem'
      }}>
        Built with ❤️ by Riya Aggarwal &nbsp;|&nbsp;
        
          href="https://www.linkedin.com/in/riya-aggarwal-28429b260/"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}