import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import RoadmapNode from './RoadmapNode';
import ChatWithRoadmap from '../Chat/ChatWithRoadmap';
import { getRoadmapData } from '../../data/roadmapRegistry';
import './Roadmap.css';
import AiTutor from '../../Pages/AiTutor/AiTutor';

const Roadmap = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if an AI generated roadmap was passed in state
    const generatedData = location.state?.generatedRoadmap;
    
    // If we have AI data, use it. Otherwise, look up from registry by ID.
    const registryData = getRoadmapData(id);
    const data = generatedData || registryData;
    
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const isChatMode = mode === 'chat';
    const knownSkills = location.state?.knownSkills || [];

    // Filter nodes if knownSkills are provided
    const displayNodes = data ? data.nodes.filter(node =>
        !knownSkills.some(skill =>
            skill.toLowerCase() === node.id.toLowerCase() ||
            skill.toLowerCase() === node.title.toLowerCase()
        )
    ) : [];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!data) {
        return (
            <div className="section-dark roadmap-not-found">
                <h2 className="section-title">Roadmap not found</h2>
                <p className="hero-subtitle">We are working on this roadmap.</p>
                <Link to="/skill-input" className="btn-large">Generate New</Link>
            </div>
        );
    }

    return (
        <div className={`section-dark roadmap-page ${isChatMode ? 'chat-mode-layout' : ''}`}>

            <div className="roadmap-main-content">
                <div className="roadmap-controls">
                    <Link to="/official-roadmaps" className="back-button">
                        ← Back to All Roadmaps
                    </Link>
                </div>
                <div className="section-header">
                    <span className="step-label">Your Path</span>
                    <h1 className="section-title">{data.title}</h1>
                    <p className="hero-subtitle">{data.description}</p>
                </div>

                <div className="roadmap-tree">
                    {displayNodes.map((node, index) => (
                        <RoadmapNode
                            key={node.id}
                            node={node}
                            isLast={index === displayNodes.length - 1}
                        />
                    ))}
                </div>
            </div>

            {isChatMode && (
                <div className="roadmap-chat-sidebar">
                    <ChatWithRoadmap isSidebar={true} roadmapData={data} />
                </div>
            )}

            {!isChatMode && <ChatWithRoadmap roadmapData={data} />}
        </div>
    );
};

export default Roadmap;
