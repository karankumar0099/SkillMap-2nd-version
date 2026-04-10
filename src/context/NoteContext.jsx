import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user._id) {
            fetchNotes(user._id);
        } else {
            setNotes([]);
        }
    }, [user]);

    const fetchNotes = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/notes/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
        setLoading(false);
    };

    const saveNote = async (roadmapId, stepId, content, isBookmarked) => {
        if (!user || (!user._id && !user.id)) return;
        const userId = user._id || user.id;

        try {
            const response = await fetch('http://localhost:5001/api/notes/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, roadmapId, stepId, content, isBookmarked }),
            });

            if (response.ok) {
                const savedNote = await response.json();
                setNotes(prev => {
                    const exists = prev.find(n => n.roadmapId === roadmapId && n.stepId === stepId);
                    if (exists) {
                        return prev.map(n => n.roadmapId === roadmapId && n.stepId === stepId ? savedNote : n);
                    } else {
                        return [...prev, savedNote];
                    }
                });
                return { success: true, note: savedNote };
            }
            return { success: false };
        } catch (error) {
            console.error("Error saving note:", error);
            return { success: false };
        }
    };

    const getNoteForStep = (roadmapId, stepId) => {
        return notes.find(n => n.roadmapId === roadmapId && n.stepId === stepId);
    };

    const bookmarkedNotes = notes.filter(n => n.isBookmarked);

    return (
        <NoteContext.Provider value={{ notes, bookmarkedNotes, loading, saveNote, getNoteForStep, fetchNotes }}>
            {children}
        </NoteContext.Provider>
    );
};

export const useNotes = () => useContext(NoteContext);
