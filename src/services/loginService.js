const jwt = require('jsonwebtoken');
const usersModel = require('../models/usersModel');

const errors = {
  emptyFild: { message: 'All fields must be filled' },
  incorrectData: { message: 'Incorrect username or password' },
};

const secret = 'useVar';

async function validateData(email, password) {
  const user = await usersModel.getUserByEmail(email);
  if (!user) return false;
  if (password !== user.password) return false;
  const { name, password: userPassword, ...payload } = user;
  const token = jwt.sign({ data: payload }, secret);
  return token;
}

async function validateLogin(email, password) {
  if (!email || !password) return { error: errors.emptyFild };
  const result = await validateData(email, password);
  if (!result) return { error: errors.incorrectData }; 
  return { token: result };
}

module.exports = {
  validateLogin,
};
