require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db/database');

// routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

// allow requests from the frontend (react dev server or deployed url)
app.use(cors());
app.use(express.json());

// create tables if they dont exist yet
initDB();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// basic health check
app.get('/', (req, res) => res.send('Taskarra API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));