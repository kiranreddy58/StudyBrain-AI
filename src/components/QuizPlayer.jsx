import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, XCircle, ArrowRight, Brain, Trophy, ListOrdered } from 'lucide-react';
import './QuizPlayer.css';

export default function QuizPlayer({ quiz, onComplete, onExit }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = quiz[currentIdx];

  useEffect(() => {
    if (quizFinished || showFeedback) return;
    
    if (timeLeft <= 0) {
      handleOptionSelect(null); 
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizFinished, showFeedback]);

  const handleOptionSelect = (idx) => {
    if (showFeedback) return;
    
    setSelectedOption(idx);
    setShowFeedback(true);
    
    if (idx === currentQuestion.correct_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setTimeLeft(60);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    return (
      <div className="quiz-result-card">
        <Trophy className="result-icon" size={64} />
        <h2>Quiz Completed!</h2>
        <div className="score-badge">
          {score} / {quiz.length}
        </div>
        <p>Accuracy: {Math.round((score / quiz.length) * 100)}%</p>
        <button className="btn-primary" onClick={() => onComplete(score)}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <div className="quiz-progress">
          <ListOrdered size={16} />
          <span>Question {currentIdx + 1}/{quiz.length}</span>
        </div>
        <div className={`quiz-timer ${timeLeft < 10 ? 'urgent' : ''}`}>
          <Timer size={16} />
          <span>{timeLeft}s</span>
        </div>
      </header>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className="question-section">
        <h2 className="question-text">{currentQuestion.question}</h2>
        
        <div className="options-grid">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = '';
            if (showFeedback) {
              if (idx === currentQuestion.correct_index) stateClass = 'correct';
              else if (idx === selectedOption) stateClass = 'incorrect';
              else stateClass = 'disabled';
            } else if (selectedOption === idx) {
              stateClass = 'selected';
            }

            return (
              <button
                key={idx}
                className={`option-btn ${stateClass}`}
                onClick={() => handleOptionSelect(idx)}
                disabled={showFeedback}
              >
                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                <span className="option-content">{option.replace(/^[A-D]\)\s*/, '')}</span>
                {showFeedback && idx === currentQuestion.correct_index && <CheckCircle2 size={18} className="feedback-icon" />}
                {showFeedback && idx === selectedOption && idx !== currentQuestion.correct_index && <XCircle size={18} className="feedback-icon" />}
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className={`feedback-card ${selectedOption === currentQuestion.correct_index ? 'success' : 'error'}`}>
          <div className="feedback-header">
            {selectedOption === currentQuestion.correct_index ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <h3>{selectedOption === currentQuestion.correct_index ? 'Correct!' : 'Incorrect'}</h3>
          </div>
          <p className="explanation-text">
            {currentQuestion.explanations[selectedOption?.toString() || currentQuestion.correct_index.toString()]}
          </p>
          {currentQuestion.reference && (
            <div className="reference-block">
              <strong>Ref:</strong> "{currentQuestion.reference}"
            </div>
          )}
          <button className="btn-next" onClick={handleNext}>
            {currentIdx < quiz.length - 1 ? 'Next Question' : 'View Results'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
