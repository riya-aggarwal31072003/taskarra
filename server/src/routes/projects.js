const express = require('express')
const { pool } = require('../db/database')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// get all projects for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT p.* FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = $1 OR pm.user_id = $1
    `, [req.user.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// create project - admin only
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can create projects.' })

  const { name, description } = req.body
  if (!name)
    return res.status(400).json({ message: 'Project name is required.' })

  try {
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', req.user.id]
    )

    const project = result.rows[0]

    // auto add creator as admin member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [project.id, req.user.id, 'admin']
    )

    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// add member to project
router.post('/:id/members', authMiddleware, async (req, res) => {
  const { userId } = req.body
  const projectId = req.params.id

  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId])
    if (project.rows.length === 0)
      return res.status(404).json({ message: 'Project not found.' })

    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [projectId, userId]
    )

    res.json({ message: 'Member added.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

// get project members
router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, pm.role FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = $1
    `, [req.params.id])
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router