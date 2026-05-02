import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { companyData } from '../data/companyData';

function CompanyTracker() {
    const [applications, setApplications] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('APPLIED');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { user } = useContext(AuthContext);

    const selectedCompanyInfo = companyData.find(c => c.name.toLowerCase() === companyName.trim().toLowerCase());

    const fetchApplications = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/applications', {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            setApplications(response.data);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/applications', 
                { companyName, role, status },
                { headers: { Authorization: `Bearer ${user.accessToken}` }}
            );
            setCompanyName('');
            setRole('');
            setStatus('APPLIED');
            fetchApplications();
        } catch (err) {
            console.error("Failed to add application", err);
        }
    };

    const handleStatusUpdate = async (id, application, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/api/applications/${id}`, 
                { ...application, status: newStatus },
                { headers: { Authorization: `Bearer ${user.accessToken}` }}
            );
            fetchApplications();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/applications/${id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            fetchApplications();
        } catch (err) {
            console.error("Failed to delete application", err);
        }
    };

    return (
        <div className="container">
            <h2>Company Tracker</h2>
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Company Name</label>
                        <input type="text" className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} list="company-suggestions" required />
                        <datalist id="company-suggestions">
                            {companyData.map(c => <option key={c.name} value={c.name} />)}
                        </datalist>
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Role</label>
                        <input type="text" className="form-control" value={role} onChange={e => setRole(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                        <label>Status</label>
                        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="SELECTED">Selected</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Add Company</button>
                </form>
            </div>

            {selectedCompanyInfo && (
                <div className="card" style={{ marginTop: '-1rem', backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--primary-color)' }}>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>✨ Insights for {selectedCompanyInfo.name}</h3>
                    <p style={{ marginBottom: '1rem' }}>{selectedCompanyInfo.description}</p>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.95rem' }}>
                        <div>
                            <strong>🎯 Eligibility:</strong> <span style={{ color: 'var(--text-color)', opacity: 0.8 }}>{selectedCompanyInfo.eligibility}</span>
                        </div>
                        <div>
                            <strong>📚 Key Topics to Master:</strong> <span style={{ color: 'var(--text-color)', opacity: 0.8 }}>{selectedCompanyInfo.topics.join(', ')}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Applied Companies</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Filter:</label>
                        <select 
                            className="form-control" 
                            style={{ padding: '0.25rem 0.5rem', width: 'auto' }}
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="SELECTED">Selected</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.filter(app => filterStatus === 'ALL' || app.status === filterStatus).map(app => (
                                <tr key={app.id}>
                                    <td style={{ fontWeight: 500 }}>{app.companyName}</td>
                                    <td>{app.role}</td>
                                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                    <td>
                                        <select 
                                            value={app.status} 
                                            onChange={(e) => handleStatusUpdate(app.id, app, e.target.value)}
                                            style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                                        >
                                            <option value="APPLIED">Applied</option>
                                            <option value="INTERVIEW">Interview</option>
                                            <option value="SELECTED">Selected</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(app.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {applications.filter(app => filterStatus === 'ALL' || app.status === filterStatus).length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>No applications match the filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CompanyTracker;
