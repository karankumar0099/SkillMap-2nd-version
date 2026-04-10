import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NoteContext';
import RoadmapLine from './RoadmapLine';
import Quiz from '../Quiz/Quiz';
import { getQuiz } from '../../data/quizRegistry';
import './Roadmap.css';

const ChevronDown = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ExternalLinkIcon = () => (
    <svg className="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

const RoadmapNode = ({ node, isLast }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteText, setNoteText] = useState("");

    const { id: roadmapId } = useParams();
    const { user, updateProgress } = useAuth();
    const { getNoteForStep, saveNote } = useNotes();

    const existingNote = getNoteForStep(roadmapId, node.id);
    const bookmarked = existingNote?.isBookmarked || false;

    useEffect(() => {
        if (existingNote) {
            setNoteText(existingNote.content || "");
        }
    }, [existingNote]);

    const staticQuiz = getQuiz(roadmapId, node.id);

   
    const isCompleted = user?.completedSteps?.some(
        step => step.roadmapId === roadmapId && step.stepId === node.id
    );

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleCheckboxChange = (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to save progress");
            return;
        }
        updateProgress(roadmapId, node.id, e.target.checked);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') toggleOpen();
    };

    const handleStartQuiz = async (e) => {
        e.stopPropagation();
        
        // Basic validation
        if (!node.title) {
            alert('Cannot generate quiz: Topic title is missing.');
            return;
        }

        setIsLoadingQuiz(true);
        setShowQuiz(true);

        const API_BASE_URL = 'http://localhost:5001';

        try {
            // Try to generate AI quiz
            console.log(`Generating quiz for: ${node.title}`);
            const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roadmapId,
                    nodeId: node.id,
                    nodeTitle: node.title,
                    nodeDescription: node.description
                })
            });

            if (response.ok) {
                const data = await response.json();
                setQuizData(data);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'AI generation failed');
            }
        } catch (error) {
            console.error('Quiz Error:', error);
            
            // Check if it's a connection error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                alert('Connection Error: Make sure your backend server is running on port 5001.');
                setShowQuiz(false);
            } else if (staticQuiz) {
                console.log('Falling back to static quiz');
                setQuizData(staticQuiz);
            } else {
                alert(`Quiz Error: ${error.message || 'Quiz not available for this topic yet.'}`);
                setShowQuiz(false);
            }
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleSaveNote = async (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to save notes.");
            return;
        }
        await saveNote(roadmapId, node.id, noteText, bookmarked);
        setIsEditingNote(false);
    };

    const handleToggleBookmark = async (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to use bookmarks.");
            return;
        }
        await saveNote(roadmapId, node.id, noteText, !bookmarked);
    };

    const handleToggleNoteEditor = (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to add or edit notes.");
            return;
        }
        setIsEditingNote(!isEditingNote);
    };

    return (
        <div className={`node-wrapper ${isOpen ? 'open' : ''}`}>
            {showQuiz && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Quiz
                        quizData={quizData}
                        isLoading={isLoadingQuiz}
                        onClose={() => {
                            setShowQuiz(false);
                            setQuizData(null);
                        }}
                        onComplete={(score, total) => {
                            if (score === total) {
                                if (!isCompleted && user) {
                                    updateProgress(roadmapId, node.id, true);
                                }
                            }
                        }}
                    />
                </div>
            )}

            <div
                className={`roadmap-node ${isOpen ? 'expanded' : ''} ${isCompleted ? 'completed-node' : ''}`}
                onClick={toggleOpen}
                role="button"
                tabIndex={0}
                onKeyPress={handleKeyPress}
            >
                <div className="node-header">
                    <div className="node-title-group">
                        <input
                            type="checkbox"
                            checked={!!isCompleted}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="node-checkbox"
                        />
                        <div className="node-title">{node.title}</div>
                    </div>
                    <div className={`node-icon ${isOpen ? 'rotate' : ''}`}>
                        <ChevronDown />
                    </div>
                </div>

                <div className={`node-content ${isOpen ? 'show' : ''}`}>
                    <p className="node-description">{node.description}</p>

                    {node.subtopics?.length > 0 && (
                        <div className="node-subtopics">
                            <h4 className="subtopics-label">Key Topics</h4>
                            <div className="subtopics-list">
                                {node.subtopics.map((topic, i) => (
                                    <span key={i} className="subtopic-tag">{topic}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {node.whyImportant && (
                        <div className="node-importance">
                            <div className="importance-label">Why it's important</div>
                            <p>{node.whyImportant}</p>
                        </div>
                    )}

                    <div className="node-actions" style={{ gap: '10px' }}>
                        {/* Always show quiz button - will try AI first, fallback to static */}
                        <button
                            className="node-link"
                            style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
                            onClick={handleStartQuiz}
                        >
                            {isLoadingQuiz ? 'Generating...' : 'Take Quiz'}
                        </button>

                        {node.website && (
                            <a
                                href={node.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="node-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Learn More <ExternalLinkIcon />
                            </a>
                        )}

                        <button 
                            className="node-link" 
                            style={{ background: 'transparent', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                            onClick={handleToggleNoteEditor}
                        >
                            {existingNote?.content || noteText ? 'Edit Note' : 'Add Note'}
                        </button>
                        
                        <button 
                            className="node-link"
                            style={{ background: 'transparent', borderColor: bookmarked ? '#f59e0b' : 'gray', color: bookmarked ? '#f59e0b' : 'gray' }}
                            onClick={handleToggleBookmark}
                        >
                            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                        </button>
                    </div>

                    {isEditingNote && (
                        <div className="note-editor" style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-tertiary)', borderRadius: '8px' }} onClick={e => e.stopPropagation()}>
                            <textarea 
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                style={{ width: '100%', minHeight: '80px', padding: '10px', background: 'var(--border-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: '4px', marginBottom: '10px', outline: 'none', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="node-link" style={{ padding: '5px 10px', fontSize: '0.9rem', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setIsEditingNote(false); setNoteText(existingNote?.content || ""); }}>Cancel</button>
                                <button className="node-link" style={{ padding: '5px 10px', fontSize: '0.9rem', background: '#10b981', borderColor: '#10b981' }} onClick={handleSaveNote}>Save Note</button>
                            </div>
                        </div>
                    )}
                    
                    {!isEditingNote && existingNote?.content && (
                        <div className="note-display" style={{ marginTop: '15px', padding: '15px', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '3px solid #8b5cf6', borderRadius: '4px' }}>
                            <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#8b5cf6' }}>Your Note:</h5>
                            <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{existingNote.content}</p>
                        </div>
                    )}
                </div>
            </div>
            {!isLast && <RoadmapLine />}
        </div>
    );
};

export default RoadmapNode;
