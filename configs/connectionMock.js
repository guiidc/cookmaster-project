const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

const DBServer = new MongoMemoryServer();
const OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };

async function getConnectionMock() {
  const URL = await DBServer.getUri();
  return MongoClient.connect(URL, OPTIONS)
  .then((conn) => conn.db('Cookmaster'));
}

module.exports = { getConnectionMock };
