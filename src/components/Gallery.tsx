import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import { MediaCard } from './MediaCard';
import { MediaListItem } from './MediaListItem';
import { MediaDetail } from './MediaDetail';
import { MediaItem } from '../types';
import { Search, Filter, Sparkles, Moon, Sun, Languages, LayoutGrid, List } from 'lucide-react';
import { t } from '../i18n';

export function Gallery() {
  const { items, language, theme, setLanguage, setTheme } = useAppStore();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'book' | 'tv'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'backlog' | 'in-progress' | 'completed' | 'rewatch'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                            item.directorOrAuthor.toLowerCase().includes(search.toLowerCase()) ||
                            item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [items, typeFilter, statusFilter, search]);

  const inProgressItems = useMemo(() => items.filter(i => i.status === 'in-progress'), [items]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header / Search */}
      <header className="sticky top-0 z-30 bg-paper/80 dark:bg-ink/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
            <h1 className="font-serif text-2xl font-semibold tracking-tight">{t('appTitle', language)}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-morandi-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder', language)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-transparent focus:border-zinc-500/30 rounded-full text-sm focus:outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full">
                {(['all', 'movie', 'book', 'tv'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                      typeFilter === f
                        ? 'bg-white dark:bg-morandi-800 shadow-sm text-zinc-900 dark:text-zinc-100'
                        : 'text-morandi-500 hover:text-ink dark:hover:text-paper'
                    }`}
                  >
                    {t(f, language)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full">
                {(['all', 'backlog', 'in-progress', 'completed', 'rewatch'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                      statusFilter === s
                        ? 'bg-white dark:bg-morandi-800 shadow-sm text-zinc-900 dark:text-zinc-100'
                        : 'text-morandi-500 hover:text-ink dark:hover:text-paper'
                    }`}
                  >
                    {s === 'all' ? t('allStatus', language) : s === 'backlog' ? t('toDo', language) : s === 'in-progress' ? t('doing', language) : s === 'completed' ? t('done', language) : t('rewatch', language)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border-l border-black/10 dark:border-white/10 pl-2 ml-1">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`p-2 rounded-full transition-colors ${viewMode === 'gallery' ? 'text-zinc-900 dark:text-zinc-100 bg-black/5 dark:bg-white/10' : 'text-morandi-500 hover:bg-black/5 dark:hover:bg-white/10'}`}
                  title={t('galleryView', language)}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'text-zinc-900 dark:text-zinc-100 bg-black/5 dark:bg-white/10' : 'text-morandi-500 hover:bg-black/5 dark:hover:bg-white/10'}`}
                  title={t('listView', language)}
                >
                  <List className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-morandi-500"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-morandi-500 flex items-center gap-1"
                  title="Toggle Language"
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">{language}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* In Progress Section */}
        {inProgressItems.length > 0 && !search && typeFilter === 'all' && statusFilter === 'all' && (
          <section className="mb-12">
            <h2 className="font-serif text-xl font-medium mb-6 text-morandi-600 dark:text-morandi-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200 animate-pulse" />
              {t('currentlyEnjoying', language)}
            </h2>
            {viewMode === 'gallery' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {inProgressItems.map((item) => (
                  <MediaCard key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inProgressItems.map((item) => (
                  <MediaListItem key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Gallery */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-medium text-morandi-600 dark:text-morandi-300">
              {search ? t('searchResults', language) : t('yourVault', language)}
            </h2>
            <span className="text-sm text-morandi-400">{filteredItems.length} {t('items', language)}</span>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 mb-4">
                <Filter className="w-8 h-8 text-morandi-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">{t('noMemories', language)}</h3>
              <p className="text-morandi-500 max-w-sm mx-auto">
                {search ? t('noMemoriesSearchDesc', language) : t('noMemoriesEmptyDesc', language)}
              </p>
            </div>
          ) : viewMode === 'gallery' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MediaCard item={item} onClick={setSelectedItem} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MediaListItem item={item} onClick={setSelectedItem} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <MediaDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
