
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  create,
  getAll,
  getById,
  reschedule,
  cancel
} = require('../controllers/appointmentController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.patch('/:id/reschedule', reschedule);
router.patch('/:id/cancel', cancel);

module.exports = router;
