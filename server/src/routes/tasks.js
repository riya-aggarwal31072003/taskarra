const express = require('express')
const { pool } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// get all users for assign dropdown
router.get('/users/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// dashboard summary
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const total = await pool.query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1', [req.user.id])
    const todo = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'todo'", [req.user.id])
    const inProgress = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'in-progress'", [req.user.id])
    const done = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = 'done'", [req.user.id])
    const overdue = await pool.query("SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < $2 AND status != 'done'", [req.user.id, today])

    res.json({
      total: parseInt(total.rows[0].count),
      todo: parseInt(todo.rows[0].count),
      inProgress: parseInt(inProgress.rows[0].count),
      done: parseInt(done.rows[0].count),
      overdue: parseInt(overdue.rows[0].count)
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// get tasks for a project
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as assigned_name FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `, [req.params.projectId])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// create task
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, priority, due_date, project_id, assigned_to } = req.body

  if (!title || !project_id)
    return res.status(400).json({ message: 'Title and project are required.' })

  try {
    const result = await pool.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [title, description || '', status || 'todo', priority || 'medium', due_date || null, project_id, assigned_to || null, req.user.id])

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// update task
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body

  try {
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Task not found.' })

    const task = existing.rows[0]

    await pool.query(`
      UPDATE tasks SET
        title = $1, description = $2, status = $3,
        priority = $4, due_date = $5, assigned_to = $6
      WHERE id = $7
    `, [
      title || task.title,
      description ?? task.description,
      status || task.status,
      priority || task.priority,
      due_date ?? task.due_date,
      assigned_to ?? task.assigned_to,
      req.params.id
    ])

    res.json({ message: 'Task updated.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id])
    res.json({ message: 'Task deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router