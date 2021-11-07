const recipesService = require('../services/recipesService');

async function createRecipe(req, res) {
  const { name, ingredients, preparation } = req.body;
  const token = req.headers.authorization;

  const newRecipe = await recipesService.createRecipe(token, name, ingredients, preparation);

  if (newRecipe.error && newRecipe.error.message === 'jwt malformed') {
    return res.status(401).json(newRecipe.error);
  }

  if (newRecipe.error) return res.status(400).json(newRecipe.error);
  res.status(201).json(newRecipe);
}

module.exports = {
  createRecipe,
};