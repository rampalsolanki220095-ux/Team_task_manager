import React, { useState, useEffect } from 'react';
import { tasks } from '../../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await tasks.getDashboardStats();
      setStats(response.data.stats);
      setRecentTasks(response.data.recentTasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '30px' }}>Dashboard</h1>
      
      <div className="grid grid-4">
        <div className="card">
          <h3>Total Tasks</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px' }}>{stats?.total || 0}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: '#d97706' }}>{stats?.pending || 0}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: '#2563eb' }}>{stats?.inProgress || 0}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: '#059669' }}>{stats?.completed || 0}</p>
        </div>
        <div className="card">
          <h3>Overdue</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: '#dc2626' }}>{stats?.overdue || 0}</p>
        </div>
        <div className="card">
          <h3>High Priority</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '10px', color: '#ea580c' }}>{stats?.highPriority || 0}</p>
        </div>
      </div>

      <div className="card">
        <h2>Recent Tasks</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Task</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Project</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Assigned To</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map(task => (
                <tr key={task._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <Link to={`/tasks`} style={{ color: '#667eea', textDecoration: 'none' }}>
                      {task.title}
                    </Link>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{task.project?.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb' }}>{task.assignedTo?.name}</td>
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
    </div>
  );
};

export default Dashboard;