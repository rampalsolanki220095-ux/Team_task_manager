const Task = require('./models/Task');
const Project = require('./models/Project');

const validateProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const isOwner = project.owner.toString() === user._id.toString();
  const isMember = project.members.some(m => m.user.toString() === user._id.toString());
  if (!isOwner && !isMember && user.role !== 'Admin') {
    return null;
  }

  return project;
};

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority } = req.body;
    
    const projectExists = await validateProjectAccess(project, req.user);
    if (!projectExists) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }
    
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority,
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('project', 'name');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.project) {
      query.project = req.query.project;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.user.role !== 'Admin') {
      const projects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).select('_id');
      
      const projectIds = projects.map(p => p._id);
      query.project = { $in: projectIds };
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateTaskAccess = async (taskId, user) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task) return null;

  const isOwner = task.project.owner.toString() === user._id.toString();
  const isMember = task.project.members.some(m => m.user.toString() === user._id.toString());
  if (!isOwner && !isMember && user.role !== 'Admin') {
    return null;
  }

  return task;
};

const getTaskById = async (req, res) => {
  try {
    const task = await validateTaskAccess(req.params.id, req.user);
    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('project', 'name');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await validateTaskAccess(req.params.id, req.user);

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    task.status = status;
    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('project', 'name');
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await validateTaskAccess(req.params.id, req.user);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('assignedBy', 'name email')
     .populate('project', 'name');
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await validateTaskAccess(req.params.id, req.user);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'Admin') {
      const projects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).select('_id');
      
      const projectIds = projects.map(p => p._id);
      query.project = { $in: projectIds };
    }
    
    const tasks = await Task.find(query);
    const now = new Date();
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate < now)).length,
      highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length,
    };
    
    const recentTasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(10);
    
    res.json({ stats, recentTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getDashboardStats,
};