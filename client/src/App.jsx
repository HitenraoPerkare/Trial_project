import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Server, Database, AlertTriangle, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({ backend: 'checking', db: 'checking' });
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      setServerStatus({ backend: 'checking', db: 'checking' });
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error('Backend failed health check');
      const data = await res.json();
      setServerStatus({
        backend: 'online',
        db: data.mongodbStatus === 'connected' ? 'online' : 'offline'
      });
      setError(null);
    } catch (err) {
      setServerStatus({ backend: 'offline', db: 'offline' });
      setError(`Cannot reach API at ${API_BASE_URL}. Ensure server is running or check VITE_API_BASE_URL.`);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tasks`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create task');
      }

      const createdTask = await res.json();
      setTasks([createdTask, ...tasks]);
      setNewTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      setTasks(tasks.map(t => t._id === id ? updated : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="glass-card">
      <header className="header">
        <h1 className="title">Deployment Practice Stack</h1>
        <p className="subtitle">Express API (Render) + React Vite (Vercel) + MongoDB Atlas</p>
        
        <div className="status-bar">
          <div className="badge">
            <Server size={14} />
            <span>Render API:</span>
            <span className={`dot ${serverStatus.backend === 'online' ? 'green' : serverStatus.backend === 'checking' ? 'yellow' : 'red'}`}></span>
            <span>{serverStatus.backend.toUpperCase()}</span>
          </div>

          <div className="badge">
            <Database size={14} />
            <span>MongoDB:</span>
            <span className={`dot ${serverStatus.db === 'online' ? 'green' : serverStatus.db === 'checking' ? 'yellow' : 'red'}`}></span>
            <span>{serverStatus.db.toUpperCase()}</span>
          </div>

          <button onClick={() => { checkHealth(); fetchTasks(); }} className="btn-icon" title="Refresh Connections">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="task-input"
        />
        <button type="submit" className="btn-primary">
          <Plus size={18} />
          <span>Add</span>
        </button>
      </form>

      <div className="task-list">
        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks created yet. Create one above!</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-item">
              <div className="task-content" onClick={() => toggleTask(task._id)}>
                {task.completed ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : (
                  <Circle size={20} color="#94a3b8" />
                )}
                <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </span>
              </div>
              <button onClick={() => deleteTask(task._id)} className="btn-icon" title="Delete Task">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="info-box">
        <strong>💡 Deployment Tip:</strong> Currently connecting to <code>{API_BASE_URL}</code>. 
        Once deployed on Render, update your Vercel Environment Variable <code>VITE_API_BASE_URL</code> to point to your live Render API URL!
      </div>
    </div>
  );
}
