const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const router = express.Router();

// SIGNUP route
// checks if email already exists, hashes the password, then creates user
router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;

  // basic validation
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required.' });

  // dont let duplicate emails in
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ message: 'Email already registered.' });

  // hash before saving obviously
  const hashed = bcrypt.hashSync(password, 10);

  // only allow admin if explicitly passed, default to member
  const userRole = role === 'admin' ? 'admin' : 'member';

  const result = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, hashed, userRole);

  // generate token right after signup so they're logged in immediately
  const token = jwt.sign(
    { id: result.lastInsertRowid, name, email, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: userRole } });
});

// LOGIN route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  // compare the hashed password
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Wrong password.' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;