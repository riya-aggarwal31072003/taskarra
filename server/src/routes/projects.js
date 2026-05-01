const express = require('express');
const { db } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// get all projects where user is either owner or a member
router.get('/', authMiddleware, (req, res) => {
  const projects = db.prepare(`
    SELECT p.* FROM projects p
    LEFT JOIN project_members pm ON p.id = pm.project_id
    WHERE p.owner_id = ? OR pm.user_id = ?
    GROUP BY p.id
  `).all(req.user.id, req.user.id);
  res.json(projects);
});

// only admins can create projects
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can create projects.' });

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required.' });

  const result = db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description || '', req.user.id);

  // auto add the creator as a member so they show up in member lists too
  db.prepare(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
  ).run(result.lastInsertRowid, req.user.id, 'admin');

  res.status(201).json({ id: result.lastInsertRowid, name, description });
});

// add a user to a project
// only the project owner or an admin can do this
router.post('/:id/members', authMiddleware, (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found.' });

  if (project.owner_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized.' });

  // INSERT OR IGNORE prevents duplicate members
  db.prepare(
    'INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)'
  ).run(projectId, userId);

  res.json({ message: 'Member added.' });
});

// get list of members for a project
router.get('/:id/members', authMiddleware, (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, pm.role FROM users u
    JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  res.json(members);
});

module.exports = router;