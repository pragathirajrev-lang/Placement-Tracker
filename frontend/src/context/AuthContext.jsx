import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
            username,
            password
        });
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const signup = async (username, email, password) => {
        return await axios.post('http://localhost:8080/api/auth/signup', {
            username,
            email,
            password
        });
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
