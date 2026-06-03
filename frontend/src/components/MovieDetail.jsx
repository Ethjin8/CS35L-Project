import { Link } from 'react-router-dom';
import './MovieDetail.css';

function getPosterSrc(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w500${path}`;
}

function detailPath(movie) {
  const isShow = movie.type === 'show' || movie.media_type === 'tv';
  return isShow ? `/show/${movie.id}` : `/movie/${movie.id}`;
}

export default function MovieDetail({ movie, onClose, actions = [] }) {
  if (!movie) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="movie-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
        >
          X
        </button>

        <div className="modal-poster-wrap">
          {getPosterSrc(movie.poster_path) ? (
            <img
              className="movie-poster"
              src={getPosterSrc(movie.poster_path)}
              alt={movie.title || movie.name}
            />
          ) : (
            <div className="modal-poster-placeholder">
              {movie.title || movie.name}
            </div>
          )}
        </div>

        <div className="modal-info">
          <p className="modal-eyebrow">{movie.type === 'show' || movie.media_type === 'tv' ? 'SHOW DETAILS' : 'MOVIE DETAILS'}</p>

          <h2 className="movie-title">{movie.title || movie.name}</h2>

          <div className="movie-chip-row">
            {(movie.release_date || movie.first_air_date) && <span>{(movie.release_date || movie.first_air_date).slice(0, 4)}</span>}
            {movie.certification && <span>{movie.certification}</span>}
            {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
            {movie.genres && <span>{movie.genres.map(g => g.name).join(', ')}</span>}
          </div>

          {movie["watch/providers"] && (
            <div className="modal-availability">
              <span className="modal-availability-label">AVAILABLE ON</span>
              <div className="modal-availability-providers">
                {movie["watch/providers"].results?.US?.flatrate?.length > 0
                  ? movie["watch/providers"].results.US.flatrate.map(p => (
                      <span key={p.provider_id} className="modal-provider-chip">
                        {p.provider_name}
                      </span>
                    ))
                  : <span className="modal-provider-none">Not available on streaming</span>
                }
              </div>
            </div>
          )}

          <p className="movie-synopsis">
            {movie.overview || 'No synopsis available.'}
          </p>

          <div className="modal-actions">
            {actions.map(({ text, onClick, added }) => (
              <button
                key={text}
                type="button"
                className={added ? 'action-added' : undefined}
                onClick={added ? undefined : onClick}
              >
                {added ? 'Added' : text}
              </button>
            ))}
            {movie.id && (
              <Link to={detailPath(movie)} className="modal-details-link">
                View Full Details →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
