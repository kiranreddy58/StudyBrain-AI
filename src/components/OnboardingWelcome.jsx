import React from 'react';
import './OnboardingWelcome.css';
import { Upload, Sparkles, Brain, BookOpen, ArrowRight } from 'lucide-react';

export default function OnboardingWelcome({ onUploadClick }) {
  return (
    <div className="onboarding-welcome-container">
      <div className="welcome-hero">
        <div className="hero-badge">Welcome to StudyBrain AI</div>
        <h1>Elevate Your Learning with <span className="gradient-text">AI Copilot</span></h1>
        <p>Upload your study materials to unlock personalized explanations, interactive quizzes, and AI-powered assignment help.</p>
        
        <button className="onboarding-cta-btn" onClick={onUploadClick}>
          <Upload size={20} />
          <span>Upload Your First Document</span>
          <ArrowRight size={18} className="arrow-icon" />
        </button>
      </div>

      <div className="onboarding-features-grid">
        <div className="onboarding-feature-card">
          <div className="feature-icon-wrapper explain">
            <Sparkles size={24} />
          </div>
          <h3>Smart Explain</h3>
          <p>Complex concepts simplified through contextual AI grounding.</p>
        </div>

        <div className="onboarding-feature-card">
          <div className="feature-icon-wrapper quiz">
            <Brain size={24} />
          </div>
          <h3>Dynamic Quizzes</h3>
          <p>Test your knowledge with AI-generated practice tests.</p>
        </div>

        <div className="onboarding-feature-card">
          <div className="feature-icon-wrapper help">
            <BookOpen size={24} />
          </div>
          <h3>Assignment Help</h3>
          <p>Step-by-step guidance for your homework and projects.</p>
        </div>
      </div>
    </div>
  );
}
