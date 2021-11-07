// const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const recipesModel = require('../models/recipesModel');

const errors = {
  invalidEntries: { message: 'Invalid entries. Try again.' },
  recipeNotFound: { message: 'recipe not found' },
};

async function createRecipe(userId, name, ingredients, preparation) {
  if (!name || !ingredients || !preparation) return { error: errors.invalidEntries };
  const result = await recipesModel.createRecipe(userId, name, ingredients, preparation);
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

async function updateRecipe(userId, recipeId, receipeData) {
  if (!ObjectId.isValid(recipeId)) return { error: errors.recipeNotFound };
  const recipe = await recipesModel.updateRecipe(userId, recipeId, receipeData);
  return recipe;
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
};