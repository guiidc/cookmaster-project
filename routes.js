const router = require('express').Router();
const userController = require('./src/controllers/usersController');
const loginController = require('./src/controllers/loginController');
const recipesController = require('./src/controllers/recipesController');

router.post('/users', userController.createUser);
router.post('/login', loginController.login);
router.get('/recipes', recipesController.getAllRecipes);
router.post('/recipes', recipesController.createRecipe);

module.exports = router;
