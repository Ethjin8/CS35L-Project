import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import mapMovie from '../lib/movieMapper';
import { authFetch } from '../lib/authFetch';
import './MovieDetailsPage.css';

const STATUS_LABELS = {
  not_started: 'Not Watched',
  completed: 'Watched',
};

function normalizeStatus(status) {
  return status === 'completed' ? 'completed' : 'not_started';
}

function getStatusLabel(status) {
  return STATUS_LABELS[normalizeStatus(status)];
}

function useFetchMovie(id, type) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMovie() {
      try {
        setLoading(true);
        setError('');

        const response = await authFetch(`/api/${type === 'show' ? 'shows' : 'movies'}/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to load movie (${response.status})`);
        }

        const data = await response.json();
        if (cancelled) return;

        const normalized = mapMovie(data);
        setMovie(normalized);
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
          setMovie(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadMovie();
    }

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  return { loading, movie, error };
}



const TABS = ['Details', 'Cast', 'Available On', 'Links'];

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const type = pathname.startsWith('/show/') ? 'show' : 'movie';
  const apiBase = type === 'show' ? 'shows' : 'movies';
  const { loading, movie, error } = useFetchMovie(id, type);
  const [activeTab, setActiveTab] = useState('Details');
  const [watchStatus, setWatchStatus] = useState('not_started');

  const [inBacklog, setInBacklog] = useState(false);

  // Load per-user backlog/status for this movie (if authenticated)
  useEffect(() => {
    let cancelled = false;
    async function loadUserStatus() {
      try {
        const res = await authFetch(`/api/${apiBase}/${id}/status`);
        if (!res.ok) return;
        const rows = await res.json();
        if (cancelled) return;
        if (rows && rows[0]) {
          setInBacklog(true);
          setWatchStatus(normalizeStatus(rows[0].status));
        } else {
          setInBacklog(false);
        }
      } catch {
        // ignore silently
      }
    }

    if (id) loadUserStatus();
    return () => { cancelled = true; };
  }, [id, apiBase]);

  const isFinished = watchStatus === 'completed';

  async function handleToggleStatus() {
    if (!movie) return;
    const next = watchStatus === 'completed' ? 'not_started' : 'completed';
    const confirmed = next === 'completed'
      ? window.confirm('Mark as watched?')
      : window.confirm('Mark as not watched?');
    if (!confirmed) return;
    const previousStatus = watchStatus;
    const wasInBacklog = inBacklog;
    setWatchStatus(next);
    setInBacklog(true);
    try {
      let res = await authFetch(`/api/backlog/status/${movie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });

      if (res.status === 404) {
        const addRes = await authFetch(`/api/${apiBase}/${movie.id}`, { method: 'POST' });
        if (!addRes.ok) throw new Error('Failed to add to backlog');
        res = await authFetch(`/api/backlog/status/${movie.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        });
      }

      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      setWatchStatus(previousStatus);
      setInBacklog(wasInBacklog);
      alert(err.message || 'Status update failed');
    }
  }

  async function handleToggleBacklog() {
    if (!movie) return;
    const next = !inBacklog;
    const confirmed = window.confirm(next ? 'Add to backlog?' : 'Remove from backlog?');
    if (!confirmed) return;
    setInBacklog(next); // optimistic
    try {
      if (next) {
        const res = await authFetch(`/api/${apiBase}/${movie.id}`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to add to backlog');
      } else {
        const res = await authFetch(`/api/${apiBase}/${movie.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove from backlog');
      }
    } catch (err) {
      setInBacklog(!next); // rollback
      alert(err.message || 'Backlog update failed');
    }
  }

  if (loading) return <p className="movie-details-message">Loading...</p>;
  if (error) return <p className="movie-details-message">{error}</p>;
  if (!movie) return <p className="movie-details-message">Movie not found.</p>;

  return (
    <div className="movie-details-page">
      <div className="movie-details-wrap">
        <button
          onClick={() => navigate(-1)}
          className="details-back-button"
        >
          ← Back
        </button>

        <section className="movie-details-shell">
          <div className="movie-details-hero">
            <div className="details-poster-frame">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="details-poster"
                />
              ) : (
                <div className="details-poster-placeholder">
                  No poster available
                </div>
              )}
            </div>

            <div className="details-hero-copy">
              <p className="details-eyebrow">{type === 'show' ? 'Show Overview' : 'Movie Overview'}</p>
              <h1>{movie.title}</h1>

              <div className="details-chip-row">
                {[
                  { label: 'date', value: movie.release_date },
                  { label: 'cert', value: movie.certification || (movie.adult ? '18+' : '') },
                  { label: 'length', value: movie.length },
                  { label: 'genre', value: movie.genre },
                ].map((item, idx) => (
                  item.value ? (
                    <span key={`${item.label}-${idx}`}>
                      {item.value}
                    </span>
                  ) : null
                ))}
              </div>

              <p className="details-overview">
                {movie.synopsis || 'No synopsis available.'}
              </p>

              <div className="details-actions">
                <button
                  type="button"
                  onClick={handleToggleBacklog}
                  aria-pressed={inBacklog}
                  data-testid="add-to-backlog"
                  className={inBacklog ? 'details-action active' : 'details-action'}
                >
                  {inBacklog ? 'Remove from Backlog' : 'Add to Backlog'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  data-testid="status-toggle"
                  aria-pressed={isFinished}
                  className={isFinished ? 'details-action active' : 'details-action'}
                >
                  {isFinished ? 'Mark as Not Watched' : 'Mark as Watched'}
                </button>
              </div>
            </div>
          </div>

          <div className="details-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'active' : ''}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="details-tab-panel">
            {activeTab === 'Details' && (
              <div className="details-facts">
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{getStatusLabel(watchStatus)}</dd>
                  </div>
                  <div>
                    <dt>Runtime</dt>
                    <dd>{movie.length || 'N/A'}</dd>
                  </div>
                  {(movie.number_of_seasons && movie.number_of_episodes)
                   &&
                  <div>
                    <dt>Seasons</dt>
                    <dd>{movie.number_of_seasons} Season{movie.number_of_seasons > 1 ? 's' : ''},</dd>
                    <dd>{movie.number_of_episodes} Episode{movie.number_of_episodes > 1 ? 's' : ''}</dd>
                  </div>
                   }
                  <div>
                    <dt>Genres</dt>
                    <dd>{movie.genre || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt>Rating</dt>
                    <dd>{movie.certification || (movie.vote_average ? `${movie.vote_average} / 10` : 'N/A')}</dd>
                  </div>
                </dl>
                <p className="details-synopsis">{movie.synopsis || 'No synopsis available.'}</p>
              </div>
            )}

            {activeTab === 'Cast' && (
              <div className="details-cast">
                {movie.credits?.cast?.length > 0 ? (
                  <ul>
                    {movie.credits.cast.slice(0, 12).map((c) => (
                      <li key={c.id || c.cast_id}>
                        <strong>{c.name}</strong> as {c.character}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No cast information available.</p>
                )}
              </div>
            )}

            {activeTab === 'Available On' && (
              <div className="details-availability-wrap">
                <div className="details-availability-section">
                  <div className="details-availability-providers">
                    {movie.watchProviders?.results?.US?.flatrate?.length > 0
                      ? movie.watchProviders.results.US.flatrate.map(p => (
                          <span key={p.provider_id} className="details-provider-chip">
                            {p.provider_name}
                          </span>
                        ))
                      : <span className="details-provider-none">Not available on streaming</span>
                    }
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Links' && (
              <div className="details-links">
                {movie.imdbUrl && (
                  <a href={movie.imdbUrl} target="_blank" rel="noreferrer">IMDb</a>
                )}
                {movie.homepage && (
                  <a href={movie.homepage} target="_blank" rel="noreferrer">Official site</a>
                )}
                {!movie.imdbUrl && !movie.homepage && (
                  <p>No links available.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
