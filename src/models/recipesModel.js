const { ObjectId } = require('mongodb');
const mongoConnection = require('../../configs/connection');

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
async function getRecipeById(id) {
  const recipe = await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').findOne({ _id: ObjectId(id) }));
  return recipe;
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
};
