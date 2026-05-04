import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { SearchResult } from '@/types';
import { searchYouTube } from '@/services/youtube';
import { saveSearchHistory, getSearchHistory, clearSearchHistory } from '@/services/storage';
import { SearchResultCard } from '@/components/SearchResultCard';
import { useDebounce } from '@/hooks/useDebounce';

const TRENDING_SEARCHES = [
  'lo-fi hip hop', 'phonk music', 'indie pop 2024', 'chill beats',
  'jazz instrumental', 'electronic music', 'pop hits 2024', 'r&b playlist',
];

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>(getSearchHistory());

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    setError('');
    searchYouTube(debouncedQuery)
      .then(data => {
        setResults(data);
        saveSearchHistory(debouncedQuery);
        setHistory(getSearchHistory());
      })
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleTrendingClick = (term: string) => {
    setQuery(term);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-full px-6 py-10" data-testid="search-page">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Search
        </h1>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, playlists, artists..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
            data-testid="input-search"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-clear-search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!query.trim() ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {history.length > 0 && (
              <section data-testid="search-history">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Recent Searches</h3>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="btn-clear-history"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map(term => (
                    <motion.button
                      key={term}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTrendingClick(term)}
                      className="px-3 py-1.5 rounded-xl glass text-sm hover:border-primary/30 transition-colors"
                      data-testid={`history-item-${term.replace(/\s+/g, '-')}`}
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>
              </section>
            )}

            <section data-testid="trending-searches">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-secondary" />
                <h3 className="text-sm font-semibold">Trending</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRENDING_SEARCHES.map((term, i) => (
                  <motion.button
                    key={term}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTrendingClick(term)}
                    className="px-4 py-3 rounded-2xl glass text-sm font-medium text-left hover:border-primary/30 hover:bg-primary/5 transition-all"
                    data-testid={`trending-search-${term.replace(/\s+/g, '-')}`}
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-white/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted-foreground">{error}</div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No results for "{query}"</div>
            ) : (
              <div className="space-y-1" data-testid="search-results">
                <p className="text-xs text-muted-foreground mb-4">{results.length} results for "{query}"</p>
                {results.map((result, i) => (
                  <SearchResultCard key={result.id} result={result} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
