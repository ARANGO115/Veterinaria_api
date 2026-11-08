const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const validatePet = require('../middlewares/validatePet');
const { register, list, get, update } = require('../controllers/petController');

const router = express.Router();

router.use(authMiddleware);
router.post('/', validatePet(), register);
router.get('/', list);
router.get('/:id', get);
router.put('/:id', validatePet({ partial: true }), update);

module.exports = router;