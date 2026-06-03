import { useState, useEffect } from 'react';
import PosterCard from '../components/PosterCard';
import mapMovie from '../lib/movieMapper';
import { authFetch } from '../lib/authFetch';
import { hasSelectedStreamingService } from '../lib/checkAvailability';
import './Search.css';

const MOVIE_GENRES_BY_ID = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  878: 'Science Fiction',
  53: 'Thriller',
};

function searchMovies(movies, titleQuery, genreQuery) {
  let results = movies;
  if (titleQuery.trim()) {
    const q = titleQuery.trim().toLowerCase();
    results = results.filter((m) => m.title?.toLowerCase().includes(q));
  }
  if (genreQuery.trim()) {
    const q = genreQuery.trim().toLowerCase();
    results = results.filter((movie) => movieMatchesGenre(movie, q));

  }
  return [...results].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0)
  );
}

function movieMatchesGenre(movie, genreQuery) {
  if (movie.genre?.toLowerCase().includes(genreQuery)) return true;
  return movie.raw?.genre_ids?.some((id) =>
    MOVIE_GENRES_BY_ID[id]?.toLowerCase().includes(genreQuery)
  );
}

export default function Search() {
  const [title, setTitle]       = useState('');
  const [genre, setGenre]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingShows, setTrendingShows] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  //Gets the streaming service selected by the user from profile, through backend.
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
    async function fetchTrending() {
      try {
        const [moviesRes, showsRes, backlogRes] = await Promise.all([
          authFetch('/api/movies/trending'),
          authFetch('/api/shows/trending'),
          authFetch('/api/backlog/sorted'),
        ]);
        if (!moviesRes.ok || !showsRes.ok) throw new Error('Failed to load trending');
        const [moviesData, showsData] = await Promise.all([moviesRes.json(), showsRes.json()]);
        const ids = new Set(
          (backlogRes.ok ? await backlogRes.json() : []).map((b) => String(b.movie_show_id))
        );
        const withBacklog = (items) =>
          (items || []).map(mapMovie).filter(Boolean).map((m) => ({ ...m, inBacklog: ids.has(String(m.id)) }));
        setTrendingMovies(withBacklog(moviesData.results).slice(0, 24));
        setTrendingShows(withBacklog(showsData.results).slice(0, 24));
      } catch (err) {
        setTrendingError(err.message);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  async function runSearch(currentTypeFilter) {
    setError('');

    if (!title.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearchLoading(true);
    try {
      const q = encodeURIComponent(title.trim());
      const [movieData, showData] = await Promise.all([
        currentTypeFilter !== 'shows'
          ? authFetch(`/api/movies/search?query=${q}`).then((r) => (r.ok ? r.json() : { results: [] }))
          : Promise.resolve({ results: [] }),
        currentTypeFilter !== 'movies'
          ? authFetch(`/api/shows/search?query=${q}`).then((r) => (r.ok ? r.json() : { results: [] }))
          : Promise.resolve({ results: [] }),
      ]);

      const movieResults = (movieData.results || []).map(m => ({ ...m, media_type: 'movie' }));
      const showResults = (showData.results || []).map(s => ({ ...s, media_type: 'tv' }));
      const combined = [...movieResults, ...showResults];
      const withDetails = await Promise.all(
        combined.map(async (item) => {
          const endpoint = item.media_type === 'tv'
            ? `/api/shows/${item.id}`
            : `/api/movies/${item.id}`;
          const detailRes = await authFetch(endpoint);
          if (!detailRes.ok) return item;
          const details = await detailRes.json();
          return { ...item, ...details, media_type: item.media_type };
        })
      );

      const backlogResponse = await authFetch('/api/backlog/sorted');
      const backlogData = backlogResponse.ok ? await backlogResponse.json() : [];

      const backlogIds = new Set(
        backlogData.map((item) => String(item.movie_show_id))
      );

      const mapped = withDetails
        .map(mapMovie)
        .filter(Boolean)
        .map((item) => ({
          ...item,
          inBacklog: backlogIds.has(String(item.id)),
        }));

      setResults(searchMovies(mapped, '', genre));
      setSearched(true);

        } catch (searchError) {
          setResults([]);
          setSearched(true);
          setError(searchError.message);
        } finally {
          setSearchLoading(false);
        }
      }

  function handleSearch(e) {
    e.preventDefault();
    runSearch(typeFilter);
  }

  useEffect(() => { if (searched) runSearch(typeFilter); }, [typeFilter]);

  const genreQ = genre.trim().toLowerCase();
  const filteredTrendingMovies = genreQ
    ? trendingMovies.filter((m) => movieMatchesGenre(m, genreQ))
    : trendingMovies;
  const filteredTrendingShows = genreQ
    ? trendingShows.filter((m) => movieMatchesGenre(m, genreQ))
    : trendingShows;
  const isTitleSearch = Boolean(searched && title.trim());

  async function handleAddToBacklog(id, mediaType) {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, inBacklog: true } : r)));
    try {
      const endpoint = mediaType === 'tv' ? `/api/shows/${id}` : `/api/movies/${id}`;
      const res = await authFetch(endpoint, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to add to backlog');
    } catch (err) {
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, inBacklog: false } : r)));
      alert(err.message || 'Failed to add to backlog');
    }
  }

  async function handleAddTrending(id, type) {
    const setter = type === 'show' ? setTrendingShows : setTrendingMovies;
    setter((prev) => prev.map((r) => (r.id === id ? { ...r, inBacklog: true } : r)));
    try {
      const endpoint = type === 'show' ? `/api/shows/${id}` : `/api/movies/${id}`;
      const res = await authFetch(endpoint, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to add to backlog');
    } catch (err) {
      setter((prev) => prev.map((r) => (r.id === id ? { ...r, inBacklog: false } : r)));
      alert(err.message || 'Failed to add to backlog');
    }
  }

  return (
    <main className="search-page">
      <section className="search-hero">
        <div className="search-hero-copy">
          <span className="search-icon" aria-hidden="true" />
          <h1>Explore</h1>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSearched(false); }}
              placeholder="Search by title..."
            />
          </div>

          <div className="search-field">
            <label>Genre</label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="action, horror..."
            />
          </div>

          <div className="search-field">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="movies">Movies</option>
              <option value="shows">TV Shows</option>
            </select>
          </div>

          <button type="submit">
            Search
          </button>
        </form>
      </section>

      <section className="search-results-section">
        {searchLoading && <p className="trending-loading">Searching…</p>}
        {!searchLoading && isTitleSearch && (
          error ? (
            <p className="search-error">{error}</p>
          ) : results.length > 0 ? (
            <>
              <div className="search-section-header">
                <h2>Search results</h2>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="search-results-grid">
                {results.map((item) => (
                  <PosterCard
                    key={`${item.raw.media_type}-${item.id}`}
                    movie={item.raw}
                    showAvail={hasSelectedStreamingService(item.raw, selectedServices)}
                    inBacklog={!!item.inBacklog}
                    actions={[
                      {
                        text: item.inBacklog ? 'Added' : '+ Backlog',
                        added: !!item.inBacklog,
                        onClick: () => !item.inBacklog && handleAddToBacklog(item.id, item.raw.media_type),
                      },
                    ]}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="search-empty-state">
              <h2>No results found</h2>
              <p>Try a different title or clear the genre filter.</p>
            </div>
          )
        )}
      </section>

      {!isTitleSearch && !searchLoading && (
        <section className="trending-section">
          {trendingLoading ? (
            <p className="trending-loading">Loading trending...</p>
          ) : trendingError ? (
            <p className="search-error">{trendingError}</p>
          ) : (
            <>
              {typeFilter !== 'shows' && (
                <TrendingRail
                  title="Trending movies"
                  items={filteredTrendingMovies}
                  onAddToBacklog={(id) => handleAddTrending(id, 'movie')}
                />
              )}
              {typeFilter !== 'movies' && (
                <TrendingRail
                  title="Trending shows"
                  items={filteredTrendingShows}
                  onAddToBacklog={(id) => handleAddTrending(id, 'show')}
                />
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}

function TrendingRail({ title, items, onAddToBacklog }) {
  return (
    <section className="trending-rail">
      <div className="search-section-header">
        <h2>{title}</h2>
      </div>
      {items.length > 0 ? (
        <div className="search-results-grid">
          {items.map((item) => (
            <PosterCard
              key={item.id}
              movie={{ ...item.raw, title: item.title }}
              inBacklog={!!item.inBacklog}
              actions={[
                {
                  text: '+ Backlog',
                  added: !!item.inBacklog,
                  onClick: () => !item.inBacklog && onAddToBacklog(item.id),
                },
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="trending-empty">No trending titles match that genre.</div>
      )}
    </section>
  );
}
