const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addMember,
  deleteProject,
} = require('../projectController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck, projectAccess } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:id')
  .get(projectAccess, getProjectById)
  .put(projectAccess, updateProject)
  .delete(projectAccess, deleteProject);

router.post('/:id/members', projectAccess, addMember);

module.exports = router;