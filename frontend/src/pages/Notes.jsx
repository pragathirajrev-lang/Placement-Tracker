import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Notes() {
    const [notes, setNotes] = useState([]);
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [filterTopic, setFilterTopic] = useState('');
    const { user } = useContext(AuthContext);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/notes', {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes", err);
        }
    };

    useEffect(() => { fetchNotes(); }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/notes',
                { topic, content },
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setTopic('');
            setContent('');
            fetchNotes();
        } catch (err) {
            console.error("Failed to add note", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            fetchNotes();
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    const uniqueTopics = [...new Set(notes.map(n => n.topic))];
    const filteredNotes = filterTopic ? notes.filter(n => n.topic === filterTopic) : notes;
    const topicColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0284c7'];

    return (
        <div className="container">
            <h2 style={{ marginBottom: '0.5rem' }}>📝 Revision Notes</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Save quick notes and revision points for each topic.</p>

            {/* Add Note Form */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Add New Note</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                            <label>Topic</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Dynamic Programming, Trees, Graphs..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Note Content</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Write your revision note here... e.g. Dijkstra uses a min-heap, time complexity O((V+E) log V)"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Note</button>
                </form>
            </div>

            {/* Filter by Topic */}
            {uniqueTopics.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: !filterTopic ? 'var(--primary-color)' : 'var(--card-bg)', color: !filterTopic ? 'white' : 'var(--text-color)', border: '1px solid var(--border-color)' }}
                        onClick={() => setFilterTopic('')}
                    >
                        All
                    </button>
                    {uniqueTopics.map((t, i) => (
                        <button
                            key={t}
                            className="btn"
                            style={{
                                backgroundColor: filterTopic === t ? topicColors[i % topicColors.length] : 'var(--card-bg)',
                                color: filterTopic === t ? 'white' : 'var(--text-color)',
                                border: `1px solid ${topicColors[i % topicColors.length]}`
                            }}
                            onClick={() => setFilterTopic(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
                    <p style={{ fontSize: '2rem' }}>📭</p>
                    <p>No notes yet! Add your first revision note above.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredNotes.map((note, i) => (
                        <div key={note.id} className="card" style={{ marginBottom: 0, borderTop: `4px solid ${topicColors[uniqueTopics.indexOf(note.topic) % topicColors.length]}`, position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                <span style={{
                                    backgroundColor: topicColors[uniqueTopics.indexOf(note.topic) % topicColors.length] + '20',
                                    color: topicColors[uniqueTopics.indexOf(note.topic) % topicColors.length],
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '99px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    {note.topic}
                                </span>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', padding: '0' }}
                                    title="Delete note"
                                >
                                    🗑️
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-color)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{note.content}</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem' }}>
                                {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notes;
