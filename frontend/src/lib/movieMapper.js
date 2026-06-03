// Normalize a TMDB movie object into the minimal shape the frontend uses.
export function mapMovie(raw) {
  console.log("RAW TMDB OBJECT:", raw);
  console.log("AVAILABLE FIELDS:", Object.keys(raw));
  if (!raw) return null;

  const posterUrl = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
  const backdropUrl = raw.backdrop_path ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}` : null;
  const dateStr = raw.release_date || raw.first_air_date;
  const year = dateStr ? dateStr.slice(0, 4) : null;
  const length = raw.runtime
    ? (raw.runtime < 60 ? `${raw.runtime}m` : `${Math.floor(raw.runtime / 60)}h ${raw.runtime % 60}m`)
    : null;
  const genre = raw.genres ? raw.genres.map((g) => g.name).join(', ') : null;
  const imdbUrl = raw.imdb_id ? `https://www.imdb.com/title/${raw.imdb_id}` : null;
  const certification = raw.certification || '';

  return {
    id: raw.id,
    title: raw.title || raw.name,
    year,
    length,
    genre,
    synopsis: raw.overview || '',
    posterUrl,
    backdropUrl,
    imdbUrl,
    credits: raw.credits || null,
    watchProviders: raw['watch/providers'] || null,
    "watch/providers": raw["watch/providers"] || null,
    vote_average: raw.vote_average || null,
    release_status: raw.status || null,
    homepage: raw.homepage || null,
    certification,
    release_date: raw.release_date || null,
    adult: !!raw.adult,
    raw,
    number_of_seasons: raw.number_of_seasons || null,
    number_of_episodes: raw.number_of_episodes || null,
    media_type: raw.media_type || (raw.title ? 'movie' : 'show'),
    episode_run_time: raw.episode_run_time || null,
    popularity: raw.popularity || null,
  };
}

export default mapMovie;
