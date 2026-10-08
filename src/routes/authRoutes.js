const express = require('express');
const { login } = require('../controllers/authController');
const validateLogin = require('../middlewares/validateLogin');

const router = express.Router();

router.post('/login', validateLogin, login);

module.exports = router;
