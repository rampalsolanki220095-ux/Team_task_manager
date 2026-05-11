const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide task title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update status to Overdue if due date passed and not completed
taskSchema.pre('save', function() {
  if (this.status !== 'Completed' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
});

module.exports = mongoose.model('Task', taskSchema);