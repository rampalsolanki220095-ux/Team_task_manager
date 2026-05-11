const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./controllers/routes/authRoutes');
const projectRoutes = require('./controllers/routes/projectRoutes');
const taskRoutes = require('./controllers/routes/taskRoutes');
const userRoutes = require('./controllers/routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Team Task Manager API' });
});

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

module.exports = app; 