import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(username, email, password);
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data;
            setError(typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'An error occurred during signup. Is the backend running?'));
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Create an Account</h2>
                {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>Sign Up</button>
                </form>
                <p style={{marginTop: '1rem', textAlign: 'center'}}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
