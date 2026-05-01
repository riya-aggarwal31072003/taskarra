import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['todo', 'in-progress', 'done'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', due_date: '', assigned_to: ''
  });

  const fetchData = () => {
    API.get(`/tasks/project/${id}`).then(r => setTasks(r.data));
    API.get(`/projects/${id}/members`).then(r => setMembers(r.data));
    API.get('/tasks/users/all').then(r => setAllUsers(r.data));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { ...form, project_id: id });
      toast.success('Task created!');
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assigned_to: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await API.put(`/tasks/${taskId}`, { status: newStatus });
    fetchData();
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await API.delete(`/tasks/${taskId}`);
    toast.success('Task deleted');
    fetchData();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="app">
      <nav className="navbar">
        <span className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>← Taskarra</span>
        <div className="nav-right">
          <span>{user?.name}</span>
        </div>
      </nav>

      <div className="container">
        <div className="section-header">
          <h2>Project Tasks</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="task-form">
            <input placeholder="Task title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="date" value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })} />
            <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Assign to...</option>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button type="submit" className="btn-primary">Create Task</button>
          </form>
        )}

        <div className="task-list">
          {tasks.length === 0 && <p className="empty">No tasks yet. Add one above!</p>}
          {tasks.map(task => (
            <div key={task.id} className={`task-card ${task.due_date && task.due_date < today && task.status !== 'done' ? 'overdue' : ''}`}>
              <div className="task-top">
                <span className="task-title">{task.title}</span>
                <div className="task-actions">
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {(user?.role === 'admin' || task.created_by === user?.id) && (
                    <button className="btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                  )}
                </div>
              </div>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                <span className={`badge status-${task.status}`}>{task.status}</span>
                {task.assigned_name && <span className="badge">👤 {task.assigned_name}</span>}
                {task.due_date && <span className="badge">📅 {task.due_date}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}