const jwt = require('jsonwebtoken');

const secret = 'useVar';

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

module.exports = { validateToken };