const express = require('express');
const { register } = require('../controllers/authController');
const validateRegistration = require('../middlewares/validateRegistration');

const router = express.Router();

router.post('/register', validateRegistration, register);

module.exports = router;
