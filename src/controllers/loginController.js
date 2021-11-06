const loginService = require('../services/loginService');

async function login(req, res) {
  const { email, password } = req.body;
  const result = await loginService.validateLogin(email, password);
  if (result.error) return res.status(401).json(result.error);
}

module.exports = { login };