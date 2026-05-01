import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

export default function NewProject() {
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', form);
      toast.success('Project created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating project');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>New Project</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Project Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
          <button type="submit">Create Project</button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}