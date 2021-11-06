const router = require('express').Router();
const userController = require('./src/controllers/usersController');
const loginController = require('./src/controllers/loginController');

router.post('/users', userController.createUser);
router.post('/login', loginController.login);

module.exports = router;
