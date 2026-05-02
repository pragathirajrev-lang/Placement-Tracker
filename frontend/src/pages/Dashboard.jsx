import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { companyData } from '../data/companyData';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, appsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/dashboard/stats', { headers: { Authorization: `Bearer ${user.accessToken}` } }),
                    axios.get('http://localhost:8080/api/applications', { headers: { Authorization: `Bearer ${user.accessToken}` } })
                ]);
                setStats(statsRes.data);
                setApplications(appsRes.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchAll();
    }, [user]);

    if (!stats) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading your dashboard...</div>;

    const topicData = stats.topicPerformance ? Object.entries(stats.topicPerformance).map(([name, value]) => ({ name, value })) : [];
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const dailyData = stats.dailyProgress ? stats.dailyProgress.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        count: d.count
    })) : [];

    // Smart Topic Reminders
    const practicedTopics = stats.topicPerformance ? Object.keys(stats.topicPerformance).map(t => t.toLowerCase()) : [];
    const missingTopicReminders = [];
    applications.forEach(app => {
        const companyInfo = companyData.find(c => c.name.toLowerCase() === app.companyName.toLowerCase());
        if (companyInfo) {
            companyInfo.topics.forEach(topic => {
                if (!practicedTopics.some(pt => pt.includes(topic.toLowerCase()) || topic.toLowerCase().includes(pt))) {
                    const key = `${app.companyName}-${topic}`;
                    if (!missingTopicReminders.find(r => r.key === key)) {
                        missingTopicReminders.push({ key, company: app.companyName, topic });
                    }
                }
            });
        }
    });

    return (
        <div className="container">
            {/* Streak Banner */}
            {stats.streak >= 3 && (
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', color: '#b45309', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🔥</span>
                    <span><strong>Amazing! You've studied {stats.streak} days in a row!</strong> Keep the momentum going!</span>
                </div>
            )}

            {/* Smart Suggestion */}
            {stats.weakestTopic && stats.weakestTopic !== 'Any Topic' && (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#1d4ed8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🧠</span>
                    <span><strong>Smart Suggestion:</strong> Your weakest area is <strong>{stats.weakestTopic}</strong>. Try revising it today!</span>
                </div>
            )}

            {/* Smart Topic Reminders */}
            {missingTopicReminders.length > 0 && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.07)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#dc2626' }}>⚠️ Missing Topics for Applied Companies:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {missingTopicReminders.slice(0, 8).map(r => (
                            <span key={r.key} style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 500 }}>
                                {r.company} → {r.topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <h2 style={{ marginBottom: '1.5rem' }}>Welcome back, {user.username}! 👋</h2>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Applications</h3>
                    <p>{stats.totalApplications}</p>
                </div>
                <div className="stat-card" style={{ borderTopColor: '#10b981' }}>
                    <h3>Selected</h3>
                    <p style={{ color: 'var(--secondary-color)' }}>{stats.selected}</p>
                </div>
                <div className="stat-card" style={{ borderTopColor: '#ef4444' }}>
                    <h3>Rejected</h3>
                    <p style={{ color: 'var(--danger-color)' }}>{stats.rejected}</p>
                </div>
                <div className="stat-card" style={{ borderTopColor: '#0284c7' }}>
                    <h3>In Progress</h3>
                    <p style={{ color: '#0284c7' }}>{stats.inProgress}</p>
                </div>
                <div className="stat-card" style={{ borderTopColor: '#f59e0b' }}>
                    <h3>Practice Streak</h3>
                    <p>{stats.streak} Days 🔥</p>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>📊 Daily Progress (Last 7 Days)</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={dailyData}>
                                <XAxis dataKey="date" stroke="var(--text-color)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-color)" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} />
                                <Bar dataKey="count" name="Problems Solved" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>🧩 Topic-wise Performance</h3>
                    <div style={{ width: '100%', height: 280 }}>
                        {topicData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={topicData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                        {topicData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2rem' }}>📝</span>
                                <span>Log some practice sessions to see your topic breakdown</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Study Planner */}
            <StudyPlannerCard user={user} stats={stats} />
        </div>
    );
}

function StudyPlannerCard({ user, stats }) {
    const [targetGoal, setTargetGoal] = useState(stats.targetGoal || '');
    const [targetDate, setTargetDate] = useState(stats.targetDate || '');
    const [saved, setSaved] = useState(false);
    const [editing, setEditing] = useState(!stats.targetGoal);

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:8080/api/dashboard/goal',
                { targetGoal, targetDate },
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save goal", err);
        }
    };

    const daysLeft = targetDate ? Math.max(0, Math.ceil((new Date(targetDate + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24))) : null;

    return (
        <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>📅 Study Planner</h3>
                {!editing && <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }} onClick={() => setEditing(true)}>Edit Goal</button>}
            </div>

            {editing ? (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                        <label>Your Target Goal</label>
                        <input type="text" className="form-control" placeholder="e.g. Complete 100 DSA problems by placement season" value={targetGoal} onChange={e => setTargetGoal(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Target Date</label>
                        <input type="date" className="form-control" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" style={{ height: '42px' }} onClick={handleSave}>
                        {saved ? '✅ Saved!' : 'Save Goal'}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 2 }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color)' }}>🎯 {targetGoal}</p>
                        {targetDate && (
                            <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.9rem' }}>
                                Target: {new Date(targetDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                    {daysLeft !== null && (
                        <div style={{ textAlign: 'center', backgroundColor: daysLeft <= 7 ? '#fee2e2' : 'rgba(16, 185, 129, 0.1)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: daysLeft <= 7 ? '#dc2626' : '#10b981', margin: 0 }}>{daysLeft}</p>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>days left</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
