const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;