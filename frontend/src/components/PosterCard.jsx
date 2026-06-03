import { useState } from 'react';
import MovieDetail from './MovieDetail';
import './PosterCard.css';
/**
 * PosterCard
 *
 * Props:
 *   movie        {object}                           - TMDB movie object
 *   dateAdded    {number}                           - Unix timestamp (ms), shown in hover panel
 *   actions      {{ text: string, onClick: fn }[]}  - buttons shown in the hover panel
 *   inBacklog    {boolean}                           - shows SAVED ribbon on the poster
 *   showAvail    {boolean}                          - whether to display the availability badge
 */
export default function PosterCard({ movie, dateAdded, actions = [], inBacklog = false, showAvail = false }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(true)}
        className="group relative aspect-[2/3] overflow-hidden border border-white outline outline-[3px] outline-black shadow-[6px_6px_0_black] bg-[#2d4675] cursor-pointer transition-transform duration-200 hover:scale-105"
      >
        {showAvail && (
        <div className="poster-streaming-badge">
            STREAM
        </div>
        )}
        {inBacklog && (
          <div className="poster-ribbon">
            <span>SAVED</span>
          </div>
        )}

        {movie.poster_path ? (
          <img
            src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title || movie.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[#ede4c5] font-bold text-sm">
            {movie.title || movie.name}
          </div>
        )}

        {/* Slide-up panel: clicking title/meta opens modal; action buttons stay isolated */}
        <div
          className="absolute inset-x-0 bottom-0 bg-black translate-y-[calc(100%-2.5rem)] group-hover:translate-y-0 transition-transform duration-300"
        >
          {/* Always-visible title bar */}
          <p className="min-h-10 flex items-center px-2 py-1 text-white text-xs font-black uppercase leading-tight line-clamp-2">
            {movie.title || movie.name}
          </p>

          {dateAdded && (
            <p className="px-2 pb-1 text-xs text-gray-400">
              Added {new Date(dateAdded).toLocaleDateString()}
            </p>
          )}

          <div className="flex flex-col gap-1 px-2 pt-1 pb-2">
            {actions.map(({ text, onClick, added }) => {
              const btnText = added ? 'Added' : text;
              const className = added
                ? 'bg-white text-black w-full py-1 text-sm font-bold border-2 border-white shadow-[3px_3px_0_black] transition-all'
                : 'bg-transparent w-full py-1 text-sm text-[#ede4c5] font-bold border-2 border-[#ede4c5] shadow-[3px_3px_0_#ede4c5] hover:shadow-[5px_5px_0_#ede4c5] hover:-translate-x-[2px] hover:-translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all';

              return (
                <button
                  key={btnText}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!added && onClick) onClick(); }}
                  className={className}
                >
                  {btnText}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {open && (
        <MovieDetail
          movie={movie}
          onClose={() => setOpen(false)}
          actions={actions}
        />
      )}
    </>
  );
}
