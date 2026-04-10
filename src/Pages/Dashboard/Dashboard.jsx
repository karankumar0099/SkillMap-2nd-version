import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NoteContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const { bookmarkedNotes } = useNotes();
    const [roadmapStats, setRoadmapStats] = useState([]);
    const [loading, setLoading] = useState(true);

    // All available roadmaps (subset for demo)
    const allRoadmaps = [
        { id: 'frontend', title: 'Frontend Developer', totalSteps: 15 },
        { id: 'backend', title: 'Backend Developer', totalSteps: 14 },
        { id: 'fullstack', title: 'Full Stack Developer', totalSteps: 20 },
        { id: 'react', title: 'React', totalSteps: 12 },
        { id: 'nodejs', title: 'Node.js', totalSteps: 10 },
        { id: 'python', title: 'Python', totalSteps: 12 },
    ];

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Calculate progress for each roadmap
        const stats = allRoadmaps.map(roadmap => {
            const completed = user.completedSteps?.filter(
                step => step.roadmapId === roadmap.id
            ).length || 0;

            const percentage = roadmap.totalSteps > 0
                ? Math.round((completed / roadmap.totalSteps) * 100)
                : 0;

            return {
                ...roadmap,
                completed,
                percentage
            };
        });

        setRoadmapStats(stats);
        setLoading(false);
    }, [user]);

    const totalCompleted = roadmapStats.reduce((sum, r) => sum + r.completed, 0);
    const totalSteps = roadmapStats.reduce((sum, r) => sum + r.totalSteps, 0);
    const overallProgress = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

    if (!user) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-empty">
                    <h2>Please Login</h2>
                    <p>You need to be logged in to view your dashboard.</p>
                    <Link to="/login" className="btn-primary">Login</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Welcome back, {user.name}! 👋</h1>
                    <p className="dashboard-subtitle">Track your learning progress across all roadmaps</p>
                </header>

                <div className="dashboard-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3>{totalCompleted}</h3>
                            <p>Steps Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <h3>{overallProgress}%</h3>
                            <p>Overall Progress</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🗺️</div>
                        <div className="stat-content">
                            <h3>{roadmapStats.filter(r => r.completed > 0).length}</h3>
                            <p>Active Roadmaps</p>
                        </div>
                    </div>
                </div>

                <section className="roadmap-progress-section">
                    <h2>Your Roadmaps</h2>
                    <div className="roadmap-grid">
                        {roadmapStats.map(roadmap => (
                            <Link
                                key={roadmap.id}
                                to={`/roadmap/${roadmap.id}`}
                                className="roadmap-card"
                            >
                                <h3>{roadmap.title}</h3>
                                <div className="progress-info">
                                    <span>{roadmap.completed} / {roadmap.totalSteps} completed</span>
                                    <span className="percentage">{roadmap.percentage}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${roadmap.percentage}%` }}
                                    ></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="roadmap-progress-section" style={{ marginTop: '3rem' }}>
                    <h2>Bookmarked Notes</h2>
                    {bookmarkedNotes && bookmarkedNotes.length > 0 ? (
                        <div className="roadmap-grid">
                            {bookmarkedNotes.map((note) => (
                                <div key={note._id || `${note.roadmapId}-${note.stepId}`} className="roadmap-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                                            {note.roadmapId} Roadmap
                                        </h3>
                                        <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★</span>
                                    </div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Step: <span style={{ color: 'var(--text-secondary)' }}>{note.stepId.replace(/-/g, ' ')}</span></p>
                                    {note.content && (
                                        <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '4px', marginBottom: '15px', flexGrow: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{note.content}</p>
                                        </div>
                                    )}
                                    <Link to={`/roadmap/${note.roadmapId}`} className="btn-primary" style={{ textAlign: 'center', padding: '8px', fontSize: '0.9rem', marginTop: 'auto' }}>
                                        Go to Roadmap
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '30px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>You haven't bookmarked any notes yet.</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>Bookmarks you add to roadmap steps will appear here.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
