const usersService = require('../services/usersService');

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  const user = await usersService.createUser({ name, email, password, role });

  if (user.error && user.error.message === 'Email already registered') {
    return res.status(409).json(user.error);
  }

  if (user.error) return res.status(400).json(user.error);
  res.status(201).json({ user });
}

module.exports = {
  createUser,
};
