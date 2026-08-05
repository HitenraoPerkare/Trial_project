require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Database Connection Variable Tracker
let isDbConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      isDbConnected = true;
      console.log(' Successfully connected to MongoDB Cluster!');
    })
    .catch((err) => {
      isDbConnected = false;
      console.error(' MongoDB Connection Error:', err.message);
    });
} else {
  console.warn('⚠️ MONGODB_URI environment variable is not defined.');
}

// Health Check Endpoint (Useful for Render deployment testing & Frontend connection monitor)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTimestamp: new Date(),
    mongodbStatus: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: 'Database not connected. Check MONGODB_URI string.' });
    }
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create task
app.post('/api/tasks', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: 'Database not connected. Check MONGODB_URI string.' });
    }
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = new Task({ title });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT toggle completion
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
});
