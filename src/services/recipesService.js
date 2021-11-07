const jwt = require('jsonwebtoken');
const recipesModel = require('../models/recipesModel');

const secret = 'useVar';

const errors = {
  invalidEntries: { message: 'Invalid entries. Try again.' },
  invalidToken: { message: 'jwt malformed' },
};

function validateToke(token) {
  try {
    jwt.verify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

async function createRecipe(token, name, ingredients, preparation) {
  if (!name || !ingredients || !preparation) return { error: errors.invalidEntries };
  if (!validateToke(token)) return { error: errors.invalidToken };
  const result = await recipesModel.createRecipe(name, ingredients, preparation);
  const [newRecipe] = result.ops;
  return { recipe: newRecipe };
}

async function getAllRecipes() {
  const recipes = await recipesModel.getAllRecipes();
  return recipes;
}

module.exports = {
  createRecipe,
  getAllRecipes,
};