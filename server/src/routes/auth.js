const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db/database')
const router = express.Router()

// signup route
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required.' })

  try {
    // check if email already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0)
      return res.status(409).json({ message: 'Email already registered.' })

    const hashed = bcrypt.hashSync(password, 10)
    const userRole = role === 'admin' ? 'admin' : 'member'

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashed, userRole]
    )

    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
})

// login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required.' })

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found.' })

    const user = result.rows[0]
    const valid = bcrypt.compareSync(password, user.password)
    if (!valid)
      return res.status(401).json({ message: 'Wrong password.' })

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router