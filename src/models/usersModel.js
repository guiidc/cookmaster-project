const mongoConnection = require('./connection');

async function createUser(userData) {
  const user = await mongoConnection.getConnection()
  .then((db) => db.collection('users').insertOne(userData));
  return user;
}

async function getUserByEmail(email) {
  const user = mongoConnection.getConnection()
  .then((db) => db.collection('users').findOne({ email }));
  return user;
}

module.exports = {
  createUser,
  getUserByEmail,
};