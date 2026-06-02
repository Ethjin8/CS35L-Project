import { useRef, useState } from 'react';
import PosterCard from './PosterCard';
import { hasSelectedStreamingService } from '../lib/checkAvailability';
import './MovieCarousel.css';

function sortMovies(movies, order) {
  const sorted = [...movies];
  return order === 'oldest'
    ? sorted.sort((a, b) => new Date(a.date_added || a.addedAt) - new Date(b.date_added || b.addedAt))
    : sorted.sort((a, b) => new Date(b.date_added || b.addedAt) - new Date(a.date_added || a.addedAt));
}

function filterMovies(movies, nameQuery, genreQuery) {
  let result = movies;
  if (nameQuery.trim()) {
    const q = nameQuery.trim().toLowerCase();
    result = result.filter((m) => m.title?.toLowerCase().includes(q));
  }
  if (genreQuery.trim()) {
    const q = genreQuery.trim().toLowerCase();
    result = result.filter((m) =>
      m.genres?.some((g) => g.name.toLowerCase().includes(q))
    );
  }
  return result;
}

export default function MovieCarousel({ title, movies, getActions, emptyMessage, showStreamingToggle = false }) {
  const rowRef = useRef(null);
  const [expanded, setExpanded]       = useState(false);
  const [sortOrder, setSortOrder]     = useState('oldest');
  const [nameQuery, setNameQuery]     = useState('');
  const [genreQuery, setGenreQuery]   = useState('');
  const [streamingOnly, setStreamingOnly] = useState(false);

  function scrollCarousel(direction) {
    rowRef.current?.scrollBy({ left: direction * 700, behavior: 'smooth' });
  }

  const streamingFiltered = streamingOnly
    ? movies.filter((m) => hasSelectedStreamingService(m))
    : movies;
  const visibleMovies = filterMovies(sortMovies(streamingFiltered, sortOrder), nameQuery, genreQuery);
  const hasFilters = Boolean(nameQuery.trim() || genreQuery.trim());
  const isEmpty = visibleMovies.length === 0;
  const fallbackMessage = emptyMessage || 'No titles here yet.';
  let emptyStateMessage;
  if (movies.length === 0) {
    emptyStateMessage = fallbackMessage;
  } else if (streamingOnly && streamingFiltered.length === 0) {
    emptyStateMessage = 'None of these titles are available on your streaming services.';
  } else {
    emptyStateMessage = 'No titles match those filters.';
  }

  const controlClass =
    'bg-transparent text-[#ede4c5] border-[3px] border-black box-border font-bold font-[Saira] text-sm px-[14px] py-[8px] outline-none';

  return (
    <section className="movie-section">
      <div className="movie-section-header">
        <h2>{title}</h2>

        <div className="flex items-stretch gap-2">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={controlClass}
            style={{ boxShadow: '4px 4px 0 black' }}
          >
            <option value="latest">Latest Added</option>
            <option value="oldest">Oldest Added</option>
          </select>

          <input
            type="text"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Title..."
            className={`${controlClass} w-28 placeholder:text-[#ede4c580]`}
            style={{ boxShadow: '4px 4px 0 black' }}
          />

          <input
            type="text"
            value={genreQuery}
            onChange={(e) => setGenreQuery(e.target.value)}
            placeholder="Genre..."
            className={`${controlClass} w-28 placeholder:text-[#ede4c580]`}
            style={{ boxShadow: '4px 4px 0 black' }}
          />

          {showStreamingToggle && (
            <button
              className={`expand-button streaming-toggle${streamingOnly ? ' streaming-toggle--active' : ''}`}
              onClick={() => setStreamingOnly((v) => !v)}
            >
              {streamingOnly ? 'Streaming ✓' : 'Streaming'}
            </button>
          )}

          <button
            className="expand-button"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Collapse ↑' : 'Expand ↗'}
          </button>
        </div>
      </div>

      <div className={`carousel-shell ${expanded ? 'expanded' : ''} ${isEmpty ? 'empty' : ''}`}>
        {!expanded && !isEmpty && (
          <button className="carousel-arrow left-arrow" onClick={() => scrollCarousel(-1)}>‹</button>
        )}

        <div
          ref={rowRef}
          className={expanded ? 'movie-grid-expanded' : 'movie-carousel-row'}
        >
          {isEmpty ? (
            <div className="carousel-empty-state">
              <p>{emptyStateMessage}</p>
              {hasFilters && <span>Try a different title or genre.</span>}
            </div>
          ) : (
            visibleMovies.map((movie) => (
              <div key={movie.id} className={expanded ? '' : 'flex-none w-[170px]'}>
                <PosterCard
                  movie={movie}
                  dateAdded={(movie.date_added || movie.addedAt) ? new Date(movie.date_added || movie.addedAt).getTime() : undefined}
                  actions={getActions ? getActions(movie) : []}
                  showAvail={false}
                />
              </div>
            ))
          )}
        </div>

        {!expanded && !isEmpty && (
          <button className="carousel-arrow right-arrow" onClick={() => scrollCarousel(1)}>›</button>
        )}
      </div>
    </section>
  );
}
