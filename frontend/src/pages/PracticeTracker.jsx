import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function PracticeTracker() {
    const [practices, setPractices] = useState([]);
    const [problemsSolved, setProblemsSolved] = useState(1);
    const [topic, setTopic] = useState('DSA');
    const { user } = useContext(AuthContext);

    const fetchPractices = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/practice', {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            setPractices(response.data);
        } catch (err) {
            console.error("Failed to fetch practices", err);
        }
    };

    useEffect(() => {
        fetchPractices();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/practice', 
                { problemsSolved, topic },
                { headers: { Authorization: `Bearer ${user.accessToken}` }}
            );
            setProblemsSolved(1);
            fetchPractices();
        } catch (err) {
            console.error("Failed to add practice record", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/practice/${id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            fetchPractices();
        } catch (err) {
            console.error("Failed to delete record", err);
        }
    };

    return (
        <div className="container">
            <h2>Daily Practice Tracker</h2>
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Problems Solved</label>
                        <input type="number" min="1" className="form-control" value={problemsSolved} onChange={e => setProblemsSolved(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Topic</label>
                        <select className="form-control" value={topic} onChange={e => setTopic(e.target.value)}>
                            <option value="DSA">DSA</option>
                            <option value="DBMS">DBMS</option>
                            <option value="OS">OS</option>
                            <option value="System Design">System Design</option>
                            <option value="Aptitude">Aptitude</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Log Practice</button>
                </form>
            </div>

            <div className="card">
                <h3>Practice History</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Topic</th>
                                <th>Problems Solved</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {practices.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.practiceDate).toLocaleDateString()}</td>
                                    <td><span className="badge" style={{backgroundColor: '#e0e7ff', color: '#4338ca'}}>{p.topic}</span></td>
                                    <td style={{ fontWeight: 600 }}>{p.problemsSolved}</td>
                                    <td>
                                        <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {practices.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No practice logged yet. Keep going!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PracticeTracker;
