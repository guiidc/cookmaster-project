const router = require('express').Router();
const middlewares = require('./middlewares/middlewares');
const upload = require('./middlewares/upload');
const userController = require('./src/controllers/usersController');
const loginController = require('./src/controllers/loginController');
const recipesController = require('./src/controllers/recipesController');

router.post('/users', userController.createUser);
router.post('/login', loginController.login);
router.get('/recipes', recipesController.getAllRecipes);
router.get('/recipes/:id', recipesController.getRecipeById);
router.post('/recipes', middlewares.validateToken, recipesController.createRecipe);
router.delete('/recipes/:id', middlewares.validateToken, recipesController.removeRecipe);
router.put('/recipes/:id', middlewares.validateToken, recipesController.updateRecipe);
router.get('/images/:image', recipesController.getRecipeImage);

router.put(
'/recipes/:id/image',
middlewares.validateToken,
middlewares.verifyAuthor,
upload.single('image'),
recipesController.updateRecipeImage,
);

module.exports = router;
