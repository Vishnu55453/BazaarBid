import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('bb_admin_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('bb_admin_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem('bb_admin_user');
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('bb_admin_token', token);
        } else {
            localStorage.removeItem('bb_admin_token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('bb_admin_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('bb_admin_user');
        }
    }, [user]);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/auth/login', { email, password });
            if (response.user.role !== 'admin') {
                throw new Error('Unauthorized: Admin access only');
            }
            setToken(response.token);
            setUser(response.user);
            return response;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('bb_admin_token');
        localStorage.removeItem('bb_admin_user');
    };

    const value = useMemo(() => ({
        user, token, isLoading, login, logout, isAuthenticated: Boolean(token && user)
    }), [user, token, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
