const usersService = require('../services/usersService');

async function createUser(req, res) {
  const { name, email, password } = req.body;
  let { role } = req.body;
  if (!role) role = 'user';
  const user = await usersService.createUser({ name, email, password, role });

  if (user.error && user.error.message === 'Email already registered') {
    return res.status(409).json(user.error);
  }

  if (user.error) return res.status(400).json(user.error);
  res.status(201).json({ user });
}

async function createAdmin(req, res) {
  const { role: actualUserRole } = req.payload;
  const newAdmin = await usersService.createAdmin(actualUserRole, req.body);
  if (newAdmin.error) return res.status(403).json(newAdmin.error);
  res.status(201).json(newAdmin);
}

module.exports = {
  createUser,
  createAdmin,
};
