import { useState, useEffect } from 'react';
import PosterCard from '../components/PosterCard';
import { authFetch } from '../lib/authFetch';
import './WatchHistory.css';

function groupItems(sortedItems, groupBy) {
  const groups = [];
  const seen = new Map();

  for (const item of sortedItems) {
    const date = new Date(item.watchedAt);
    const key = groupBy === 'year'
      ? `${date.getFullYear()}`
      : `${date.getFullYear()}-${date.getMonth()}`;
    const label = groupBy === 'year'
      ? `${date.getFullYear()}`
      : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!seen.has(key)) {
      seen.set(key, { label, items: [] });
      groups.push(seen.get(key));
    }
    seen.get(key).items.push(item);
  }

  return groups;
}

export default function WatchHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('latest');
  const [groupBy, setGroupBy] = useState('month');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch('/api/backlog/full');
        if (!res.ok) throw new Error('Failed to load watch history');
        const data = await res.json();
        setItems(
          data
            .filter((item) => item.status === 'completed')
            .map((item) => ({ ...item, watchedAt: new Date(item.date_added).getTime() }))
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function endpointFor(item) {
    return `/api/${item.type === 'show' ? 'shows' : 'movies'}/${item.id}`;
  }

  async function handleMoveToBacklog(id) {
    if (!window.confirm('Move this to your backlog?')) return;
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await authFetch(`/api/backlog/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'not_started' }),
      });
      if (!res.ok) throw new Error('Failed to move to backlog');
    } catch (err) {
      setItems((prev) => [...prev, item]);
      alert(err.message || 'Failed to move to backlog');
    }
  }

  async function handleRemove(id) {
    if (!window.confirm('Remove this from your watch history?')) return;
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await authFetch(endpointFor(item), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
    } catch (err) {
      setItems((prev) => [...prev, item]);
      alert(err.message || 'Failed to remove');
    }
  }

  if (loading) {
    return (
      <main className="watch-history-page">
        <p className="watch-history-loading">Loading…</p>
      </main>
    );
  }

  const typeFiltered = typeFilter === 'movies'
    ? items.filter((i) => i.type !== 'show')
    : typeFilter === 'shows'
    ? items.filter((i) => i.type === 'show')
    : items;

  const sortedItems = [...typeFiltered].sort((a, b) =>
    sortOrder === 'latest' ? b.watchedAt - a.watchedAt : a.watchedAt - b.watchedAt
  );

  const groups = groupItems(sortedItems, groupBy);

  return (
    <main className="watch-history-page">
      <section className="watch-history-header">
        <div>
          <p>Completed queue</p>
          <h1>Watch History</h1>
        </div>
        <div className="history-controls">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="movies">Movies</option>
            <option value="shows">TV Shows</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="latest">Latest Watched</option>
            <option value="oldest">First Watched</option>
          </select>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="month">Group by Month</option>
            <option value="year">Group by Year</option>
          </select>
        </div>
      </section>

      <section className="history-groups">
        {groups.length === 0 ? (
          <p className="history-empty">No watched titles yet. Mark something as watched from your backlog.</p>
        ) : (
          groups.map(({ label, items: groupItems }) => (
            <div key={label} className="history-group">
              <div className="history-group-header">
                <span>{label}</span>
                <strong>{groupItems.length} watched</strong>
              </div>
              <div className="history-grid">
                <div className="watch-history-grid">
                  {groupItems.map((item) => (
                    <PosterCard
                      key={item.id}
                      movie={item}
                      dateAdded={item.watchedAt}
                      actions={[
                        { text: 'Move to Backlog', onClick: () => handleMoveToBacklog(item.id) },
                        { text: 'Remove',          onClick: () => handleRemove(item.id) },
                      ]}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
