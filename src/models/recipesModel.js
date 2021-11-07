const mongoConnection = require('./connection');

async function createRecipe(name, ingredients, preparation) {
  const newRecipe = await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').insertOne({ name, ingredients, preparation }));
  return { _id: newRecipe.insertedId, ...newRecipe };
}

async function getAllRecipes() {
  const recipes = await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').find().toArray());
  return recipes;
}

module.exports = {
  createRecipe,
  getAllRecipes,
};
