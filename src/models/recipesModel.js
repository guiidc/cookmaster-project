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

async function removeRecipe(recipeId) {
  const recipe = await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').deleteOne({ _id: ObjectId(recipeId) }));
  return recipe;
}

async function updateRecipeImage(id) {
  const image = `localhost:3000/src/uploads/${id}.jpeg`;
  const recipe = await getRecipeById(id);
  await mongoConnection.getConnection()
  .then((db) => db.collection('recipes').updateOne(
    { _id: ObjectId(id) }, { $set: { image } },
    ));

  return { ...recipe, image };
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  removeRecipe,
  updateRecipeImage,
};
