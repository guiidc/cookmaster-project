const { ObjectId } = require('mongodb');
const mongoConnection = require('../../configs/connection');

async function createRecipe(userId, name, ingredients, preparation) {
  const newRecipe = await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').insertOne({ userId, name, ingredients, preparation }));
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

async function updateRecipe(userId, recipeId, recipeData) {
  const { name, ingredients, preparation } = recipeData;
  await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').updateOne(
    { _id: ObjectId(recipeId) },
    { $set: { userId, name, ingredients, preparation } },
  ));
  return { _id: recipeId, ingredients, name, preparation, userId };
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
};
