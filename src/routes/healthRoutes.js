const express = require('express');
const { getHealth } = require('../controllers/healthController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getHealth);

module.exports = router;
