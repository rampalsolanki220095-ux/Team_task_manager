const Project = require('./models/Project');
const User = require('./models/User');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    let query;
    
    if (req.user.role === 'Admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      });
    }
    
    const projects = await query.populate('owner', 'name email').populate('members.user', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to add members to this project' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const alreadyMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember || project.owner.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'User already a member' });
    }
    
    project.members.push({ user: user._id, role: role || 'Member' });
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addMember,
  deleteProject,
};