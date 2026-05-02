import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <h1 style={{ margin: 0 }}>PlacementTracker</h1>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/">Dashboard</Link>
                <Link to="/companies">Company Tracker</Link>
                <Link to="/practice">Practice</Link>
                <Link to="/notes">Notes</Link>
                <button 
                    onClick={toggleTheme} 
                    className="btn" 
                    style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                >
                    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;
