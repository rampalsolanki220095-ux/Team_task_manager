import React, { useState, useEffect } from 'react';
import { tasks, projects, users } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Tasks = () => {
  const [taskList, setTaskList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ project: '', status: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter.project) params.project = filter.project;
      if (filter.status) params.status = filter.status;
      
      const response = await tasks.getAll(params);
      setTaskList(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projects.getAll();
      setProjectList(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await tasks.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '30px' }}>All Tasks</h1>

      <div className="card">
        <h3>Filters</h3>
        <div className="grid grid-3">
          <div className="form-group">
            <label>Project</label>
            <select value={filter.project} onChange={(e) => setFilter({ ...filter, project: e.target.value })}>
              <option value="">All Projects</option>
              {projectList.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn" onClick={() => setFilter({ project: '', status: '' })}>Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Project</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Assigned To</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Priority</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map(task => (
                <tr key={task._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <strong>{task.title}</strong>
                    <br />
                    <small>{task.description}</small>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{task.project?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{task.assignedTo?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <span className={`priority-${task.priority.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '4px' }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {new Date(task.dueDate) < new Date() && task.status !== 'Completed' && (
                      <div style={{ color: '#dc2626', fontSize: '12px' }}>Overdue!</div>
                    )}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tasks;