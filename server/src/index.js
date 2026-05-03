require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initDB } = require('./db/database')

const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const taskRoutes = require('./routes/tasks')

const app = express()

app.use(cors())
app.use(express.json())

// init database tables then start server
initDB().then(() => {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch(err => {
  console.error('Database connection failed:', err)
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => res.send('Taskarra API is running'))