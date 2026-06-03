import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'

const pages = [
  { label: 'Home',         path: '/home' },
  { label: 'Explore',      path: '/search' },
  { label: 'Watch History',path: '/history' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accountOpen) return;

    function handlePointerDown(event) {
      if (!accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  async function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken');

    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  }

  return (
    <nav className="nav-bar flex flex-wrap py-2">
      <section className="nav-logo">
        <img src={logo} alt="Logo" />
      </section>
      {pages.map(({ label, path }) => (
        <Link
          key={path}
          to={path}
          className={`nav-link ${
            pathname === path
              ? 'active'
              : ''
          }`}
        >
          {label}
        </Link>
      ))}

      <div className="account-dropdown" ref={accountRef}>
        <button
          type="button"
          className={`nav-link account-btn ${pathname === '/profile' ? 'profile-active' : ''} ${accountOpen ? 'menu-open' : ''}`}
          onClick={() => setAccountOpen(!accountOpen)}
          aria-label="Account menu"
          aria-expanded={accountOpen}
        >
          <span className="profile-icon" aria-hidden="true">
            <span className="profile-icon-head" />
            <span className="profile-icon-shoulders" />
          </span>
        </button>

        {accountOpen && (
          <div className="dropdown-menu">
            <Link to="/profile" className={`dropdown-item ${pathname === '/profile' ? 'dropdown-active' : ''}`} onClick={() => setAccountOpen(false)}>Profile</Link>
            <button className="dropdown-item logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </div>
    </nav>
  );
}
