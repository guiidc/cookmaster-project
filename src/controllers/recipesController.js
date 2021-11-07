const recipesService = require('../services/recipesService');

async function createRecipe(req, res) {
  const { name, ingredients, preparation } = req.body;
  const { _id: userId } = req.payload;

  const newRecipe = await recipesService.createRecipe(userId, name, ingredients, preparation);

  if (newRecipe.error) return res.status(400).json(newRecipe.error);
  res.status(201).json(newRecipe);
}

async function getAllRecipes(_req, res) {
  const recipes = await recipesService.getAllRecipes();
  res.status(200).json(recipes);
}

async function getRecipeById(req, res) {
  const { id } = req.params;
  const recipe = await recipesService.getRecipeById(id);
  if (recipe.error) return res.status(404).json(recipe.error);
  res.status(200).json(recipe);
}

async function updateRecipe(req, res) {
  const { id: recipeId } = req.params;
  const { _id: userId } = req.payload;
  const recipe = await recipesService.updateRecipe(userId, recipeId, req.body);
  if (recipe.error) return res.status(404).json(recipe.error);
  res.status(200).json(recipe);
}

async function removeRecipe(req, res) {
  const { id: recipeId } = req.params;
  await recipesService.removeRecipe(req.payload, recipeId);
  // if (!recipe) return null;
  return res.status(204).json();
}

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  removeRecipe,
};