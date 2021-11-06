const { MongoClient } = require('mongodb');

let db = null;

const URL = 'mongodb://127.0.0.1:27017/Cookmaster';
const OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };

async function getConnection() {
  return await db
  ? Promise.resolve(db)
  : MongoClient.connect(URL, OPTIONS)
  .then((conn) => {
    db = conn.db('Cookmaster');
    return db;
  }).catch((err) => {
    console.log(err);
    process.exit();
  });
}

module.exports = { getConnection };
