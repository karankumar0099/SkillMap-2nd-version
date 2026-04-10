 import React, { useState } from 'react';
import './Quiz.css';

const Quiz = ({ quizData, isLoading, onClose, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    // Show loading state
    if (isLoading || !quizData) {
        return (
            <div className="quiz-overlay">
                <div className="quiz-modal">
                    <div className="quiz-header">
                        <h3 className="quiz-title">Generating Quiz...</h3>
                        <button className="quiz-close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div className="quiz-content" style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: '#8b5cf6' }}>⏳</div>
                        <p style={{ color: '#a0a0a0', marginTop: '16px' }}>AI is creating unique questions for you...</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const totalQuestions = quizData.questions.length;

    const handleOptionClick = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex + 1 < totalQuestions) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowScore(true);
            if (onComplete) onComplete(score, totalQuestions);
        }
    };

    const calculatePercentage = () => {
        return (score / totalQuestions) * 100;
    };

    if (showScore) {
        return (
            <div className="quiz-overlay">
                <div className="quiz-modal">
                    <div className="quiz-header">
                        <h3 className="quiz-title">Quiz Completed!</h3>
                        <button className="quiz-close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div className="quiz-content">
                        <div className="quiz-score-container">
                            <div className="quiz-score-circle" style={{ '--progress': `${calculatePercentage()}%` }}>
                                <span className="quiz-score-text">{score}/{totalQuestions}</span>
                            </div>
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
                                {calculatePercentage() >= 70 ? 'Great Job!' : 'Keep Learning!'}
                            </h2>
                            <p className="quiz-score-message">
                                You scored {score} out of {totalQuestions} questions correctly.
                            </p>
                            <button className="quiz-next-btn" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-overlay">
            <div className="quiz-modal">
                <div className="quiz-header">
                    <h3 className="quiz-title">{quizData.title || 'Knowledge Check'}</h3>
                    <button className="quiz-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="quiz-content">
                    <div className="quiz-question-number">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </div>
                    <h2 className="quiz-question-text">{currentQuestion.question}</h2>

                    <div className="quiz-options">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = "quiz-option-btn";
                            if (isAnswered) {
                                if (index === currentQuestion.correctAnswer) {
                                    optionClass += " correct";
                                } else if (index === selectedOption) {
                                    optionClass += " wrong";
                                }
                            } else if (selectedOption === index) {
                                optionClass += " selected";
                            }

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isAnswered}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="quiz-footer">
                    <button
                        className="quiz-next-btn"
                        onClick={handleNext}
                        disabled={!isAnswered}
                        style={{ opacity: isAnswered ? 1 : 0.5 }}
                    >
                        {currentQuestionIndex + 1 === totalQuestions ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
