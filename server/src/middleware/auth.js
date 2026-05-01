const jwt = require('jsonwebtoken');

// middleware to check if the user is logged in
// just reads the token from the Authorization header
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format is "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

  try {
    // verify the token using the secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaching user info to the request
    next();
  } catch (err) {
    // token is invalid or expired
    res.status(403).json({ message: 'Invalid token.' });
  }
}

// separate middleware for admin-only routes
// call this after authMiddleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };