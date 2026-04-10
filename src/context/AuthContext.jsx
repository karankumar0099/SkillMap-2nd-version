import React, { createContext, useState, useEffect, useContext } from 'react';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
                // Optionally verify token validity with backend /me endpoint here
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const updateProgress = async (roadmapId, stepId, isCompleted) => {
        if (!user) return;

        // Optimistic update
        const updatedUser = { ...user };
        if (isCompleted) {
            if (!updatedUser.completedSteps.some(s => s.roadmapId === roadmapId && s.stepId === stepId)) {
                updatedUser.completedSteps.push({ roadmapId, stepId });
            }
        } else {
            updatedUser.completedSteps = updatedUser.completedSteps.filter(s => !(s.roadmapId === roadmapId && s.stepId === stepId));
        }
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep local storage in sync

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roadmapId, stepId, isCompleted })
            });

            if (!response.ok) {
                // Revert if failed (could implement better error handling/revert logic)
                console.error("Failed to save progress");
            }
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProgress }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
