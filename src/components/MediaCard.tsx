import { motion } from 'motion/react';
import { MediaItem } from '../types';
import { Play, BookOpen, Tv, Star, CheckCircle2, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { t } from '../i18n';

interface MediaCardProps {
  key?: string | number;
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

export function MediaCard({ item, onClick }: MediaCardProps) {
  const { deleteItem, language } = useAppStore();
  const Icon = item.type === 'movie' ? Play : item.type === 'book' ? BookOpen : Tv;

  return (
    <motion.div
      layoutId={`card-${item.id}`}
      onClick={() => onClick(item)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-morandi-50 dark:bg-morandi-900 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img
          src={item.coverUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/600`;
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex gap-2">
          {item.status === 'completed' && (
            <div className="bg-emerald-500/90 text-white p-1.5 rounded-full shadow-sm backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="bg-black/40 backdrop-blur-md text-white p-1.5 rounded-full shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Hover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pr-12 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-white font-serif font-semibold text-lg leading-tight mb-1 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-white/80 text-xs mb-2 truncate">
            {item.directorOrAuthor}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {item.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-white/20 text-white border border-white/10 backdrop-blur-sm"
                >
                  {tag.replace('#', '')}
                </span>
              ))}
            </div>
            {item.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium text-white">{item.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(t('deleteConfirm', language))) {
              deleteItem(item.id);
            }
          }}
          className="absolute bottom-3 right-3 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 z-20 shadow-lg translate-y-4 group-hover:translate-y-0"
          title={t('deleteConfirm', language)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
