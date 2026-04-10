import React, { useState, useRef, useEffect } from 'react';
import './AiTutor.css';
import ReactMarkdown from 'react-markdown';

const AiTutor = ({ mode = 'page', roadmapContext = null }) => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // General SkillMap chips shown on the main /ai-tutor page
    const generalChips = [
        "🗺️ Generate a Roadmap",
        "💼 Career Path Advice",
        "📚 Recommend Resources",
        "🚀 Project Ideas",
    ];

    // Roadmap-specific chips shown when inside a roadmap
    const roadmapChips = [
        "❓ What should I learn first?",
        "🔧 Best tools & resources",
        "💡 Project ideas for this roadmap",
        "⏱️ How long will this take?",
    ];

    const generalQuestions = [
        "What roadmap should I start with as a complete beginner?",
        "How long does it take to become a Frontend Developer?",
        "Generate a roadmap for becoming a Data Scientist",
        "What languages should a Backend Developer know?",
        "Recommend a project I can build in a weekend",
        "What is the difference between DevOps and SRE?",
    ];

    const roadmapQuestions = roadmapContext ? [
        `What are the most important topics in ${roadmapContext.title}?`,
        `What projects can I build to practice ${roadmapContext.title}?`,
        `What jobs require ${roadmapContext.title} skills?`,
        `Recommended courses or books for ${roadmapContext.title}?`,
    ] : [];

    const suggestionChips = roadmapContext ? roadmapChips : generalChips;
    const predefinedQuestions = roadmapContext ? roadmapQuestions : generalQuestions;

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const processMessage = async (text) => {
        setMessages(prev => [...prev, { text, sender: 'user' }]);
        setLoading(true);

        try {
            const payload = { message: text };
            if (roadmapContext) {
                payload.roadmapContext = {
                    id: roadmapContext.id,
                    title: roadmapContext.title,
                    nodes: (roadmapContext.nodes || []).map(n => ({
                        title: n.title,
                        description: n.description || '',
                    })),
                };
            }

            const response = await fetch("http://localhost:5001/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
            } else {
                setMessages(prev => [...prev, { text: "Sorry, I couldn't understand that.", sender: 'ai' }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: "Error connecting to AI server. Make sure the backend is running.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || loading) return;
        const text = inputText;
        setInputText('');
        await processMessage(text);
    };

    const getContainerClass = () => {
        if (mode === 'section') return 'ai-container-section';
        if (mode === 'card') return 'ai-container-card';
        if (mode === 'sidebar') return 'ai-container-sidebar';
        return 'ai-tutor-container';
    };

    const getWrapperClass = () => {
        if (mode === 'section') return 'ai-wrapper-section';
        if (mode === 'card') return 'ai-wrapper-card';
        if (mode === 'sidebar') return 'ai-wrapper-sidebar';
        return 'ai-tutor-page section-dark';
    };

    const headerTitle = roadmapContext
        ? `${roadmapContext.title} AI Tutor`
        : 'SkillMap AI — How can I help you?';

    return (
        <div className={getWrapperClass()}>
            <div className={getContainerClass()}>

                <h1 className="ai-header-title">{headerTitle}</h1>
                {roadmapContext && (
                    <p className="ai-context-badge">
                        📍 Roadmap context: <strong>{roadmapContext.title}</strong>
                    </p>
                )}

                {messages.length === 0 ? (
                    <>
                        <div className="ai-chips-grid">
                            {suggestionChips.map((chip, index) => (
                                <button key={index} className="ai-chip" onClick={() => processMessage(chip)}>
                                    {chip}
                                </button>
                            ))}
                        </div>

                        <div className="ai-questions-list">
                            {predefinedQuestions.map((q, index) => (
                                <button key={index} className="ai-question-item" onClick={() => processMessage(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="ai-chat-history">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.sender}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-message ai ai-thinking">
                                <span className="dot">●</span>
                                <span className="dot">●</span>
                                <span className="dot">●</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}

                <div className="ai-input-wrapper">
                    <form onSubmit={handleSend} className="ai-input-box">
                        <input
                            type="text"
                            placeholder={roadmapContext ? `Ask about ${roadmapContext.title}...` : "Ask me anything about learning tech..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="ai-send-btn" disabled={loading}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AiTutor;
