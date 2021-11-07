const secret = 'useVar';
const jwt = require('jsonwebtoken');

function validateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'missing auth token' });
  try {
    const payload = jwt.verify(token, secret);
    req.payload = payload.data;
  } catch (err) {
    return res.status(401).json({ message: 'jwt malformed' });
  }
  next();
}

function verifyAuthor(req, res, next) {
  next();
}

module.exports = { validateToken, verifyAuthor };