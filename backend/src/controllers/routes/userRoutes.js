const express = require('express');
const { getUsers, getUserById } = require('../userController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', roleCheck('Admin'), getUsers);
router.get('/:id', getUserById);

module.exports = router;