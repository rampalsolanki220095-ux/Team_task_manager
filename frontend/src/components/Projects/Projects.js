import React, { useState, useEffect } from 'react';
import { projects } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projectList, setProjectList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projects.getAll();
      setProjectList(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projects.create({ name, description });
      setName('');
      setDescription('');
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projects.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white' }}>Projects</h1>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}>
          Create Project
        </button>
      </div>

      <div className="grid grid-3">
        {projectList.map(project => (
          <div key={project._id} className="card">
            <h3>{project.name}</h3>
            <p style={{ color: '#666', marginTop: '10px' }}>{project.description}</p>
            <div style={{ marginTop: '15px' }}>
              <span className="status-badge" style={{ background: project.status === 'Active' ? '#10b981' : '#6b7280' }}>
                {project.status}
              </span>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <Link to={`/projects/${project._id}`} className="btn btn-primary">View Details</Link>
              {(user.role === 'Admin' || project.owner?._id === user?._id) && (
                <button className="btn btn-danger" onClick={() => handleDeleteProject(project._id)}>
                  Delete
                </button>
              )}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Owner: {project.owner?.name}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
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
          <div className="card" style={{ width: '500px' }}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;