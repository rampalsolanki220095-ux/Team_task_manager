const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }
    
    next();
  };
};

const projectAccess = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.project;
    
    if (!projectId) {
      return next();
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();
    
    if (!isMember && !isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Not a project member' });
    }
    
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { roleCheck, projectAccess };