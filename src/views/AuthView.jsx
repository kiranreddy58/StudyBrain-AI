import { useState, useEffect } from 'react';
import './AuthView.css';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Brain,
  Zap
} from 'lucide-react';
import { setCurrentUser } from '../utils/api';

export default function AuthView({ initialMode = 'login', onAuthSuccess, onBackToHome }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    setMode(initialMode);
    resetMessages();
  }, [initialMode]);

  const handleModeSwitch = (m) => {
    resetMessages();
    setMode(m);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!identifier.trim()) {
      setError('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
      }

      setSuccess('Logged in successfully! Loading your vault...');
      setCurrentUser(data.user, data.token);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.user);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
          display_name: displayName.trim() || username.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      setSuccess('Account created successfully! Preparing your workspace...');
      setCurrentUser(data.user, data.token);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(data.user);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = async () => {
    resetMessages();
    setLoading(true);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const demoEmail = `scholar_${rand}@studybrain.ai`;
    const demoUser = `scholar_${rand}`;
    const demoPass = 'StudyBrainPass2026!';

    try {
      let res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          username: demoUser,
          password: demoPass,
          display_name: `Scholar #${rand}`
        }),
      });
      let data = await res.json();

      if (!res.ok) {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: demoEmail, password: demoPass }),
        });
        data = await res.json();
      }

      if (data.token) {
        setSuccess(`Logged in as Scholar #${rand}!`);
        setCurrentUser(data.user, data.token);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(data.user);
        }, 500);
      } else {
        throw new Error('Failed to start demo session');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen-container">
      {/* Background ambient glowing orbs */}
      <div className="auth-ambient-glow glow-1" />
      <div className="auth-ambient-glow glow-2" />

      {/* Top Bar with Back to Home button */}
      <header className="auth-screen-topbar">
        <button className="auth-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="auth-topbar-brand" onClick={onBackToHome}>
          <span className="auth-topbar-name">Study<strong>Brain</strong> AI</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-card-badge">
            <ShieldCheck size={14} color="#10b981" />
            <span>Multi-Tenant Isolated Vault</span>
          </div>

          <h1 className="auth-card-title">
            {mode === 'login' ? 'Sign In to Your Vault' : 'Create Student Account'}
          </h1>
          <p className="auth-card-subtitle">
            {mode === 'login'
              ? 'Enter your credentials to access your personal study materials, notes & AI tutor.'
              : 'Join StudyBrain AI to store your documents, quizzes, and learning analytics securely.'}
          </p>

          {/* Toggle Tabs */}
          <div className="auth-card-tabs">
            <button 
              type="button" 
              className={`auth-card-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('login')}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-card-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('register')}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="auth-card-alert error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-card-alert success">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form-body">
              <div className="auth-input-group">
                <label>Email or Username</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="student@example.com or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form-body">
              <div className="auth-input-row">
                <div className="auth-input-group">
                  <label>Full / Display Name</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Kiran Kumar"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Username</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="kirankumar"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password (min. 6 characters)</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Quick Demo Section */}
          <div className="auth-card-divider">
            <span>or instant test</span>
          </div>

          <button 
            type="button" 
            className="auth-demo-action-btn"
            onClick={handleDemoAccount}
            disabled={loading}
          >
            <Zap size={16} color="#22d3ee" />
            <span>Launch 1-Click Instant Demo Scholar Account</span>
          </button>

          {/* Bottom Switch Link */}
          <div className="auth-card-switch">
            {mode === 'login' ? (
              <p>
                New to StudyBrain?{' '}
                <button type="button" onClick={() => handleModeSwitch('register')}>
                  Create an account free
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button type="button" onClick={() => handleModeSwitch('login')}>
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Feature Highlights on Desktop */}
        <div className="auth-feature-list">
          <div className="auth-feature-item">
            <div className="feature-icon"><Brain size={20} color="var(--color-accent-2)" /></div>
            <div>
              <h4>Sub-Second Groq AI</h4>
              <p>Powered by Groq LPUs for lightning fast explanations, step-by-step guidance & quizzes.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="feature-icon"><BookOpen size={20} color="var(--color-accent-3)" /></div>
            <div>
              <h4>Multi-Modal RAG</h4>
              <p>Upload lecture notes, textbooks & PDFs with exact citations and semantic chunks.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="feature-icon"><ShieldCheck size={20} color="#10b981" /></div>
            <div>
              <h4>Private Multi-Tenant Storage</h4>
              <p>Every student's materials, questions, and mastery scores remain 100% isolated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
