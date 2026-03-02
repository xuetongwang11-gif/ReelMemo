import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { extractMediaInfo } from '../services/gemini';
import { useAppStore } from '../store';
import { MediaItem, MediaType, MediaStatus } from '../types';
import { t } from '../i18n';
import { compressImage } from '../utils';

export function MagicIntake({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<MediaItem> | null>(null);
  const { addItem, language } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const data = await extractMediaInfo(input);
      setPreviewData(data);
    } catch (error) {
      console.error(error);
      alert('Failed to extract information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setPreviewData(prev => prev ? { ...prev, coverUrl: base64 } : null);
    } catch (error) {
      console.error('Failed to upload image', error);
    }
  };

  const handleSave = () => {
    if (!previewData?.title) return;
    
    addItem({
      title: previewData.title || 'Untitled',
      type: (previewData.type as MediaType) || 'movie',
      coverUrl: previewData.coverUrl || `https://picsum.photos/seed/${encodeURIComponent(previewData.title)}/400/600`,
      directorOrAuthor: previewData.directorOrAuthor || 'Unknown',
      genre: previewData.genre || [],
      status: 'backlog',
      progress: 0,
      rating: 0,
      tags: previewData.tags || [],
      quotes: [],
      review: '',
      summary: previewData.summary || '',
    });
    
    setPreviewData(null);
    setInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
                  {t('magicIntake', language)}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!previewData ? (
                <div className="space-y-4">
                  <p className="text-sm text-morandi-500 dark:text-morandi-300">
                    {t('magicIntakeDesc', language)}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                      placeholder={t('inputPlaceholder', language)}
                      className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleExtract}
                    disabled={isLoading || !input.trim()}
                    className="w-full py-3 px-4 bg-ink text-paper dark:bg-paper dark:text-ink rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t('extractMetadata', language)}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-36 shrink-0 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 relative group">
                      {previewData.coverUrl ? (
                        <img
                          src={previewData.coverUrl}
                          alt={previewData.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(previewData.title || 'cover')}/400/600`;
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-morandi-400">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">{t('uploadCover', language)}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-serif text-lg font-semibold leading-tight truncate">
                        {previewData.title || t('untitled', language)}
                      </h3>
                      <p className="text-sm text-morandi-500 dark:text-morandi-300 truncate">
                        {previewData.directorOrAuthor || t('unknown', language)} • {previewData.type ? t(previewData.type as any, language) : ''}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {previewData.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-morandi-600 dark:text-morandi-200 line-clamp-3 leading-relaxed">
                    {previewData.summary}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setPreviewData(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-medium border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      {t('retry', language)}
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 py-2.5 px-4 bg-ink text-paper dark:bg-paper dark:text-ink rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {t('addToVault', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
