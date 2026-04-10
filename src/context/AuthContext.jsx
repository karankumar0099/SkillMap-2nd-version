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

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };

    const saveCustomRoadmap = async (roadmap) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/save-roadmap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roadmap })
            });

            if (response.ok) {
                const customRoadmaps = await response.json();
                const updatedUser = { ...user, customRoadmaps };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error saving custom roadmap:", error);
        }
    };

    const deleteRoadmap = async (roadmapId) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/roadmap/${roadmapId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error deleting roadmap:", error);
        }
    };

    const trackVisit = async (roadmapId, stepId) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/track-visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roadmapId, stepId })
            });

            if (response.ok) {
                const visitedLinks = await response.json();
                const updatedUser = { ...user, visitedLinks };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error tracking visit:", error);
        }
    };

    const trackQuiz = async (roadmapId, stepId) => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/track-quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roadmapId, stepId })
            });

            if (response.ok) {
                const quizAttempts = await response.json();
                const updatedUser = { ...user, quizAttempts };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error tracking quiz:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            updateProgress, 
            saveCustomRoadmap, 
            deleteRoadmap, 
            trackVisit, 
            trackQuiz 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
