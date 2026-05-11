import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects, tasks, users } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium'
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');

  useEffect(() => {
    fetchProjectData();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [id, user]);

  const fetchProjectData = async () => {
    try {
      const projectRes = await projects.getById(id);
      setProject(projectRes.data);
      
      const tasksRes = await tasks.getAll({ project: id });
      setProjectTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await users.getAll();
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setTaskLoading(true);
    try {
      await tasks.create({
        ...newTask,
        project: id
      });
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'Medium'
      });
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating task';
      setTaskError(errorMessage);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projects.addMember(id, { email: memberEmail, role: memberRole });
      setShowMemberModal(false);
      setMemberEmail('');
      setMemberRole('Member');
      fetchProjectData();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const canManageProject = () => {
    return user.role === 'Admin' || project?.owner?._id === user?._id;
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <button className="btn" onClick={() => navigate('/projects')}>← Back to Projects</button>
      </div>

      <div className="card">
        <h1>{project.name}</h1>
        <p style={{ marginTop: '10px' }}>{project.description}</p>
        <div style={{ marginTop: '15px' }}>
          <span className="status-badge" style={{ background: project.status === 'Active' ? '#10b981' : '#6b7280' }}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Team Members</h2>
          {canManageProject() && (
            <button className="btn btn-primary" onClick={() => setShowMemberModal(true)}>
              Add Member
            </button>
          )}
        </div>
        <div className="grid grid-3">
          <div>
            <strong>Owner:</strong> {project.owner?.name} ({project.owner?.email})
          </div>
          {project.members?.filter(m => m.user?._id !== project.owner?._id).map(member => (
            <div key={member.user?._id}>
              <strong>{member.user?.name}</strong> - {member.role}
              <br />
              <small>{member.user?.email}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Tasks</h2>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            Create Task
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Assigned To</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Priority</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map(task => (
                <tr key={task._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{task.title}</td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div className="card" style={{ width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Create New Task</h2>
            {taskError && (
              <div style={{ 
                background: '#fee2e2', 
                color: '#dc2626', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                border: '1px solid #fca5a5'
              }}>
                <strong>Error:</strong> {taskError}
              </div>
            )}
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                  disabled={taskLoading}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  required
                  disabled={taskLoading}
                />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  required
                  disabled={taskLoading}
                >
                  <option value="">Select user</option>
                  {(user?.role === 'Admin' ? allUsers : [project.owner, ...(project.members?.map(m => m.user) || [])])
                    .filter(Boolean)
                    .map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  disabled={taskLoading}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                  disabled={taskLoading}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => { setShowTaskModal(false); setTaskError(''); }} disabled={taskLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={taskLoading}>
                  {taskLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h2>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>User Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;