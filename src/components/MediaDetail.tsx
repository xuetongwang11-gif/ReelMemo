import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Trash2, Calendar, Tag, Quote, CheckCircle2, Star, Play, BookOpen, Tv, Loader2, Sparkles, Upload, Plus, Minus, History } from 'lucide-react';
import { MediaItem, MediaStatus, RewatchRecord } from '../types';
import { useAppStore } from '../store';
import { polishReview } from '../services/gemini';
import { t } from '../i18n';
import { compressImage } from '../utils';

interface MediaDetailProps {
  item: MediaItem;
  onClose: () => void;
}

export function MediaDetail({ item, onClose }: MediaDetailProps) {
  const { updateItem, deleteItem, language } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draftReview, setDraftReview] = useState(item.review || '');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showDopamine, setShowDopamine] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(
    item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [isAddingRewatch, setIsAddingRewatch] = useState(false);
  const [newRewatchDate, setNewRewatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRewatchNotes, setNewRewatchNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save review
  useEffect(() => {
    if (!isEditing && draftReview !== item.review) {
      updateItem(item.id, { review: draftReview });
    }
  }, [isEditing, draftReview, item.id, item.review, updateItem]);

  const handleStatusChange = (newStatus: MediaStatus) => {
    if (newStatus === 'completed' && item.status !== 'completed') {
      setShowDopamine(true);
      setTimeout(() => setShowDopamine(false), 3000);
    }
    
    const updates: Partial<MediaItem> = { status: newStatus };
    
    if (newStatus === 'completed') {
      updates.endDate = item.endDate || new Date().toISOString();
    } else if (newStatus === 'in-progress' && !item.startDate) {
      updates.startDate = new Date().toISOString();
    } else if (newStatus === 'rewatch') {
      setIsAddingRewatch(true);
    }
    
    updateItem(item.id, updates);
  };

  const handleDateSave = () => {
    updateItem(item.id, { endDate: new Date(tempDate).toISOString() });
    setIsEditingDate(false);
  };

  const handleAddRewatch = () => {
    const newRecord: RewatchRecord = {
      id: crypto.randomUUID(),
      date: new Date(newRewatchDate).toISOString(),
      review: newRewatchNotes,
    };
    updateItem(item.id, {
      rewatches: [...(item.rewatches || []), newRecord],
      rewatchCount: (item.rewatchCount || 0) + 1,
      status: 'completed' // Reset status to completed after logging rewatch
    });
    setIsAddingRewatch(false);
    setNewRewatchNotes('');
    setNewRewatchDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteRewatch = (recordId: string) => {
    if (window.confirm(t('deleteConfirm', language))) {
      const updatedRewatches = (item.rewatches || []).filter(r => r.id !== recordId);
      updateItem(item.id, {
        rewatches: updatedRewatches,
        rewatchCount: Math.max(0, (item.rewatchCount || 0) - 1)
      });
    }
  };

  const handlePolishReview = async () => {
    if (!draftReview.trim()) return;
    setIsPolishing(true);
    try {
      const polished = await polishReview(draftReview);
      setDraftReview(polished);
    } catch (error) {
      console.error(error);
      alert('Failed to polish review.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      updateItem(item.id, { coverUrl: base64 });
    } catch (error) {
      console.error('Failed to upload image', error);
    }
  };

  const Icon = item.type === 'movie' ? Play : item.type === 'book' ? BookOpen : Tv;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        layoutId={`card-${item.id}`}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-paper dark:bg-ink shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Column: Cover & Quick Actions */}
        <div className="w-full md:w-1/3 shrink-0 relative">
          <div className="aspect-[2/3] md:aspect-auto md:h-full relative group">
            <img
              src={item.coverUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/600`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">{t('uploadCover', language)}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors md:hidden z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
              <div className="flex gap-2 mb-4 pointer-events-auto">
                {(['backlog', 'in-progress', 'completed', 'rewatch'] as MediaStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg backdrop-blur-md transition-all ${
                      item.status === s
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'bg-black/40 text-white/80 hover:bg-black/60 border border-white/10'
                    }`}
                  >
                    {s === 'backlog' ? t('toDo', language) : s === 'in-progress' ? t('doing', language) : s === 'completed' ? t('done', language) : t('rewatch', language)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{t(item.type, language)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{item.rating || '-'} / 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Review */}
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col gap-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden md:block"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Info */}
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2 pr-12">
              {item.title}
            </h2>
            <p className="text-lg text-morandi-500 dark:text-morandi-300 mb-4">
              {item.directorOrAuthor}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                >
                  {tag}
                </span>
              ))}
              {item.genre?.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-morandi-100 dark:bg-morandi-800 text-morandi-600 dark:text-morandi-300"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="text-morandi-600 dark:text-morandi-300 leading-relaxed text-sm sm:text-base">
              {item.summary}
            </p>
          </div>

          {/* Review Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-medium flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-morandi-400" />
                {t('personalReview', language)}
              </h3>
              <button
                onClick={handlePolishReview}
                disabled={isPolishing || !draftReview.trim()}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isPolishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {t('aiPolish', language)}
              </button>
            </div>
            
            <textarea
              value={draftReview}
              onChange={(e) => setDraftReview(e.target.value)}
              placeholder={t('reviewPlaceholder', language)}
              className="w-full flex-1 min-h-[120px] p-4 rounded-xl bg-morandi-50 dark:bg-morandi-900/50 border border-transparent focus:border-zinc-500/30 focus:ring-2 focus:ring-zinc-500/10 resize-none transition-all outline-none text-morandi-700 dark:text-morandi-200 leading-relaxed mb-6"
            />

            {/* Rewatch Section */}
            {(item.rewatches?.length || 0) > 0 && (
              <div className="mb-6 space-y-4">
                <h3 className="font-serif text-lg font-medium flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                  <History className="w-4 h-4 text-morandi-400" />
                  {t('rewatchCount', language)} ({item.rewatchCount || item.rewatches?.length || 0})
                </h3>
                <div className="space-y-3">
                  {item.rewatches?.map((record) => (
                    <div key={record.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteRewatch(record.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all"
                          title={t('deleteRewatch', language)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {record.review || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAddingRewatch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{t('addRewatch', language)}</h4>
                  <input
                    type="date"
                    value={newRewatchDate}
                    onChange={(e) => setNewRewatchDate(e.target.value)}
                    className="text-xs bg-transparent border-b border-zinc-300 dark:border-zinc-600 focus:outline-none focus:border-zinc-500 text-ink dark:text-paper"
                  />
                </div>
                <textarea
                  value={newRewatchNotes}
                  onChange={(e) => setNewRewatchNotes(e.target.value)}
                  placeholder={t('rewatchNotes', language)}
                  className="w-full min-h-[80px] p-3 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 resize-none outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingRewatch(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {t('cancel', language)}
                  </button>
                  <button
                    onClick={handleAddRewatch}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    {t('saveRewatch', language)}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5 mt-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-xs text-morandi-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {isEditingDate ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={tempDate}
                      onChange={(e) => setTempDate(e.target.value)}
                      className="bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-500 text-ink dark:text-paper"
                    />
                    <button onClick={handleDateSave} className="text-zinc-800 dark:text-zinc-200 font-medium hover:underline">
                      {t('saveDate', language)}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{item.endDate ? `${t('watchedOn', language)} ${new Date(item.endDate).toLocaleDateString()}` : `${t('addedOn', language)} ${new Date(item.createdAt).toLocaleDateString()}`}</span>
                    <button onClick={() => setIsEditingDate(true)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200" title={t('editDate', language)}>
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-morandi-400">
                <button 
                  onClick={() => setIsAddingRewatch(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {t('addRewatch', language)}
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm(t('deleteConfirm', language))) {
                  deleteItem(item.id);
                  onClose();
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dopamine Effect */}
        <AnimatePresence>
          {showDopamine && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
            >
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-zinc-200 dark:border-zinc-800">
                <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  <CheckCircle2 className="w-10 h-10 text-white dark:text-black" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {t('memoryCompleted', language)}
                </h3>
                <p className="text-morandi-500 font-medium">
                  {t('memoryCompletedDesc', language)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
