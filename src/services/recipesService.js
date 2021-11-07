const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const recipesModel = require('../models/recipesModel');

const secret = 'useVar';

const errors = {
  invalidEntries: { message: 'Invalid entries. Try again.' },
  invalidToken: { message: 'jwt malformed' },
  recipeNotFound: { message: 'recipe not found' },
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

async function getRecipeById(id) {
  if (!ObjectId.isValid(id)) return { error: errors.recipeNotFound };
  const recipe = await recipesModel.getRecipeById(id);
  return recipe;
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
};