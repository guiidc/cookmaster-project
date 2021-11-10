const validator = require('validator');
const usersModel = require('../models/usersModel');

const errors = {
  entryError: { message: 'Invalid entries. Try again.' },
  emailExistsError: { message: 'Email already registered' },
  adminError: { message: 'Only admins can register new admins' },
};

function validateName(name) {
  if (!name) return false;
  return true;
}

function validateEmail(email) {
  if (!email || !validator.isEmail(email)) return false;
  return true;
}

function validatePassword(password) {
  if (!password) return false;
  return true;
}

async function emailExists(email) {
  const alreadyExists = await usersModel.getUserByEmail(email);
  if (alreadyExists) return true;
  return false;
}

async function createUser(userData) {
  const { name, email, password, role } = userData;
  if (!validateName(name)) return { error: errors.entryError };
  if (!validateEmail(email)) return { error: errors.entryError };
  if (!validatePassword(password)) return { error: errors.entryError };
  if (await emailExists(email)) return { error: errors.emailExistsError };
  const result = await usersModel.createUser(userData);
  return { name, email, role, _id: result.insertedId };
}

async function createAdmin(actualUserRole, userData) {
  if (actualUserRole !== 'admin') return { error: errors.adminError };
  const newAdmin = await createUser({ ...userData, role: 'admin' });
  return { user: newAdmin };
}

module.exports = {
  createUser,
  createAdmin,
};
