import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Taskarra</h1>
        <p className="auth-sub">Create your account</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Full Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}