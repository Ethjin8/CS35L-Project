import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import '../pages/Auth.css';
import MovieCarousel from '../components/MovieCarousel';
import { authFetch } from '../lib/authFetch';
import { hasSelectedStreamingService } from '../lib/checkAvailability';

function getPosterSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
}

function formatDate(dateValue) {
  if (!dateValue) return 'Unknown';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString();
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const loginMsg = location.state?.message;
  const [backlogItems, setBacklogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //Gets the streaming service selected by the user from profile,
  // returns null if no streaming service is selected.
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    async function loadSelectedServices() {
      try {
        const res = await authFetch("/api/streaming");

        if (!res.ok) {
          console.log("Failed to fetch streaming services:", res.status);
          console.log(await res.text());
          return;
        }

        const data = await res.json();

        const services = data.map((row) => row.streaming_service);

        setSelectedServices(services);
        localStorage.setItem("selectedServices", JSON.stringify(services));

        console.log("selected services from backend:", services);
      } catch (err) {
        console.log("Error loading streaming services:", err);
        setSelectedServices([]);
      }
    }

    loadSelectedServices();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await authFetch('/api/backlog/full');
        if (!res.ok) throw new Error('Failed to load backlog');
        const data = await res.json();
        if (!mounted) return;
        setBacklogItems(data.map((m) => ({ ...m, status: m.status || 'not_started', removed: false })));

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loginMsg) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, loginMsg, navigate]);

  const currentBacklog = backlogItems.filter((movie) => 
    !movie.removed && movie.status !== 'completed');
  const availableBacklog = currentBacklog.filter((movie) => 
    hasSelectedStreamingService(movie));

  // Generate random # once on rendering
  const [randomNum] = useState(() => Math.random());
  // Produce random recommendation from movies still in the backlog
  const recommended = currentBacklog[Math.floor(randomNum * currentBacklog.length)];

  function endpointFor(item) {
    const kind = item?.type === 'show' ? 'shows' : 'movies';
    return `/api/${kind}/${item?.id}`;
  }

  async function handleWatched(id) {
    if (!window.confirm('Mark as watched? This will move it to your watch history.')) return;
    const movie = backlogItems.find((m) => m.id === id);
    setBacklogItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'completed' } : m)));
    try {
      let res = await authFetch(`/api/backlog/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.status === 404) {
        const addRes = await authFetch(endpointFor(movie), { method: 'POST' });
        if (!addRes.ok) throw new Error('Failed to add to backlog');
        res = await authFetch(`/api/backlog/status/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });
      }
      if (!res.ok) throw new Error('Failed to update watched status');
    } catch (err) {
      setBacklogItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'not_started' } : m)));
      alert(err.message || 'Failed to update watched status');
    }
  }

  async function handleRemove(id) {
    if (!window.confirm('Remove this from your backlog?')) return;
    setBacklogItems((prev) => prev.map((m) => (m.id === id ? { ...m, removed: !m.removed } : m)));
    const movie = backlogItems.find((m) => m.id === id);
    const willRemove = !(movie?.removed);
    try {
      if (willRemove) {
        const res = await authFetch(endpointFor(movie), { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove from backlog');
      } else {
        const res = await authFetch(endpointFor(movie), { method: 'POST' });
        if (!res.ok) throw new Error('Failed to restore to backlog');
      }
    } catch (err) {
      setBacklogItems((prev) => prev.map((m) => (m.id === id ? { ...m, removed: movie?.removed } : m)));
      alert(err.message || 'Failed to update backlog removal');
    }
  }

  if (loading) {
    return (
      <main className="home-page">
        <p className="home-loading">Loading…</p>
      </main>
    );
  }

  return (
    <main className="home-page">
      {loginMsg && <p className="toast-message success-message">{loginMsg}</p>}
      {error && <p className="toast-message error-message">{error}</p>}
      {!error && !recommended && (
        <section className="recommended-hero empty-hero">
          <div className="recommended-hero-inner empty-hero-inner">
            <div className="recommended-text">
              <p className="hero-label">YOUR BACKLOG IS EMPTY</p>
              <h1>Start building your queue</h1>
              <p className="recommended-synopsis">
                Add a few titles from Explore and Rewind will surface a backlog recommendation here.
              </p>
              <Link to="/search" className="hero-link-button">
                Explore titles
              </Link>
            </div>
          </div>
        </section>
      )}

      {recommended && (
        <section className="recommended-hero">
          <div className="recommended-hero-inner">
            <div className="recommended-card">
              {getPosterSrc(recommended.poster_path) ? (
                <img
                  src={getPosterSrc(recommended.poster_path)}
                  alt={recommended.title}
                  className="recommended-hero-image"
                />
              ) : (
                <div className="recommended-poster-placeholder">
                  {recommended.title}
                </div>
              )}
            </div>

            <div className="recommended-text">
              <p className="hero-label">
                TODAY'S BACKLOG RECOMMENDATION
              </p>
              <h1>{recommended.title}</h1>

              <div className="recommended-meta">
                <span>
                  <strong>Release date</strong>
                  {formatDate(recommended.release_date || recommended.releaseDate)}
                </span>
                <span>
                  <strong>Saved since</strong>
                  {formatDate(recommended.date_added || recommended.addedAt)}
                </span>
              </div>

              <p className="recommended-synopsis">
                {recommended.overview ? recommended.overview : 'No synopsis available.'}
              </p>

              <div className="hero-buttons">
                <button type="button" onClick={() => handleWatched(recommended.id)}>
                  Mark as Watched
                </button>
                <button type="button" onClick={() => handleRemove(recommended.id)}>REMOVE</button>
                <Link to={`/${recommended.type === 'show' ? 'show' : 'movie'}/${recommended.id}`} className="hero-details-button">
                  VIEW DETAILS
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="home-section">
        <MovieCarousel
          title="MY BACKLOG"
          movies={currentBacklog}
          emptyMessage="Your backlog is empty. Use Explore to add movies or shows."
          getActions={(movie) => [
            { text: 'Mark as Watched', onClick: () => handleWatched(movie.id) },
            { text: 'Remove', onClick: () => handleRemove(movie.id) },
          ]}
        />
        <MovieCarousel
          title="Available on my streaming services"
          movies={availableBacklog}
          emptyMessage="No streaming matches yet. Add backlog items and streaming services to see available titles here."
          getActions={(movie) => [
            { text: 'Mark as Watched', onClick: () => handleWatched(movie.id) },
            { text: 'Remove', onClick: () => handleRemove(movie.id) },
          ]}
        />
      </section>
    </main>
  );
}
