import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import logo from '../assets/logo.png';
import loginImage from '../assets/login-image.png';

export default function Landing() {
  const [view, setView] = useState(null);
  const [message, setRegistrationMessage] = useState(null);

  return (
    <div className="login-split">
      <section className="left-side">
        {!view && (
          <div className="auth-null">
            <div className="brand-block">
              <section className="logo-image">
                <img src={logo} alt="Logo"></img>
              </section>
              <h1>REWIND</h1>
              <p className="tagline">Press Play on the Past</p>
            </div>

            <div className="auth-options">
              <button onClick={() => setView('login')}>Log In</button>
              <button onClick={() => setView('register')}>Sign Up</button>
            </div>
          </div>
        )}

        {view === 'login' && (
          <LoginView
            onSwitch={() => setView('register')}
            onBack={() => setView(null)}
            registrationMsg={message}
          />
        )}

        {view === 'register' && (
          <RegisterView
            onSwitch={(msg) => {
              setView('login');
              setRegistrationMessage(msg);
            }}
            onBack={() => setView(null)}
          />
        )}
      </section>
      <section className="auth-image">
        <img src={loginImage} alt="Login" />
      </section>
    </div>
  );
}

function LoginView({ onSwitch, onBack, registrationMsg }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const message = await response.text();
      setError(message || 'Login failed. Please try again.');
      return;
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    navigate('/home', { state: { message: 'Successfully logged in!' } });
  }

  return (
    <section className="auth-page">
      <button type="button" className="back-button" onClick={onBack}>← Back</button>
      {registrationMsg && <p className="success-message">{registrationMsg}</p>}
      {error && <p className="error-message" key={error}>{error}</p>}
      <h1>LOG IN</h1>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Username</label>
          <input
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Log In</button>
      </form>

      <p>
        Don't have an account?{' '}
        <a href="/register" onClick={(e) => { e.preventDefault(); onSwitch(); }} className="link">
          Sign up
        </a>
      </p>
    </section>
  );
}

function RegisterView({ onSwitch, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || 'Account creation failed. Please try again.');
      return;
    }

    onSwitch('Account created! You may now log in.');
  }

  return (
    <section className="auth-page">
      <button type="button" className="back-button" onClick={onBack}>← Back</button>
      {error && <p className="error-message" key={error}>{error}</p>}
      <h1>CREATE ACCOUNT</h1>

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Username</label>
          <input
            id="username"
            placeholder="Enter your username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label>Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>

      <p>
        Already have an account?{' '}
        <a href="/login" onClick={(e) => { e.preventDefault(); onSwitch(); }} className="link">
          Log in
        </a>
      </p>
    </section>
  );
}
