const express = require('express');
const { db } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// get all tasks for a specific project
// also joining user name so we can show who it's assigned to
router.get('/project/:projectId', authMiddleware, (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, u.name as assigned_name FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.projectId);
  res.json(tasks);
});

// dashboard summary - counts tasks by status for the logged in user
router.get('/dashboard', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const total = db.prepare(
    'SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?'
  ).get(req.user.id);

  const todo = db.prepare(
    "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'todo'"
  ).get(req.user.id);

  const inProgress = db.prepare(
    "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'in-progress'"
  ).get(req.user.id);

  const done = db.prepare(
    "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'done'"
  ).get(req.user.id);

  // overdue = past due date and not done yet
  const overdue = db.prepare(
    "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND due_date < ? AND status != 'done'"
  ).get(req.user.id, today);

  res.json({
    total: total.count,
    todo: todo.count,
    inProgress: inProgress.count,
    done: done.count,
    overdue: overdue.count
  });
});

// create a new task
router.post('/', authMiddleware, (req, res) => {
  const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;

  if (!title || !project_id)
    return res.status(400).json({ message: 'Title and project are required.' });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    description || '',
    status || 'todo',
    priority || 'medium',
    due_date || null,
    project_id,
    assigned_to || null,
    req.user.id // whoever is logged in created this task
  );

  res.status(201).json({ id: result.lastInsertRowid, title });
});

// update task - used for changing status, priority, assignment etc
router.put('/:id', authMiddleware, (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

  if (!task) return res.status(404).json({ message: 'Task not found.' });

  // keep old values if new ones arent passed
  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, status = ?,
      priority = ?, due_date = ?, assigned_to = ?
    WHERE id = ?
  `).run(
    title || task.title,
    description ?? task.description,
    status || task.status,
    priority || task.priority,
    due_date ?? task.due_date,
    assigned_to ?? task.assigned_to,
    req.params.id
  );

  res.json({ message: 'Task updated.' });
});

// delete a task
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted.' });
});

// get all users - needed for the assign dropdown when creating tasks
router.get('/users/all', authMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role FROM users').all();
  res.json(users);
});

module.exports = router;