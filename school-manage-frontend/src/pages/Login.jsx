import React, { useEffect, useRef, useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@edutech.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const [passValid, setPassValid] = useState(null);
  const [strength, setStrength] = useState({ score: 0, level: '', cls: '' });

  const emailInputRef = useRef(null);
  const passInputRef = useRef(null);

  const emailMax = 20;
  const passMax = 15;

  const validateEmail = (value) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (value.length > 0 && !isValid) {
      setEmailValid(false);
      return false;
    } else if (value.length > 0 && isValid) {
      setEmailValid(true);
      return true;
    } else {
      setEmailValid(null);
      return false;
    }
  };

  const checkStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;
    score = Math.min(4, Math.floor(score / 2));

    let level = 'Weak';
    let cls = 'weak';
    if (score >= 4) { level = 'Strong'; cls = 'strong'; }
    else if (score >= 3) { level = 'Medium'; cls = 'medium'; }

    setStrength({ score, level, cls });
  };

  const validatePassword = (value) => {
    const minLen = 6;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (value.length > 0 && value.length < minLen) {
      setPassValid(false);
      return false;
    } else if (value.length > 0 && (!hasLetter || !hasNumber)) {
      setPassValid(false);
      return false;
    } else if (value.length >= minLen) {
      setPassValid(true);
      return true;
    } else {
      setPassValid(null);
      return false;
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.slice(0, emailMax);
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value.slice(0, passMax);
    setPassword(value);
    checkStrength(value);
    validatePassword(value);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isPassValid) {
      setError('Password must be at least 6 characters with letters and numbers.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'admin@edutech.com' && password === 'Admin@123') {
        onLoginSuccess();
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    }, 600);
  };

  const handleRememberMe = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (checked) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      setEmail(saved);
      validateEmail(saved);
      setRememberMe(true);
    }
    checkStrength(password);
    validatePassword(password);
  }, []);

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="icon"><i className="bi bi-mortarboard-fill"></i></div>
          <div>
            <h2>Edu<span className="highlight">Tech</span></h2>
            <p className="text-muted">School Management System</p>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 px-3 mb-3">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={handleEmailChange}
              placeholder="admin@edutech.com"
              required
            />
          </div>
          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Admin@123"
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={rememberMe} onChange={handleRememberMe} id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
            </div>
            <button type="button" className="btn btn-link p-0">Forgot password?</button>
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
