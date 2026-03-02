import { motion } from 'motion/react';
import { MediaItem } from '../types';
import { Play, BookOpen, Tv, Star, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { t } from '../i18n';

interface MediaListItemProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

export function MediaListItem({ item, onClick }: MediaListItemProps) {
  const { deleteItem, language } = useAppStore();
  const Icon = item.type === 'movie' ? Play : item.type === 'book' ? BookOpen : Tv;

  return (
    <div
      onClick={() => onClick(item)}
      className="group flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/400/600`;
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
            <Icon className="w-4 h-4 text-zinc-400" />
            {item.title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
            {item.directorOrAuthor}
          </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2 w-40">
            {item.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 truncate max-w-[80px]"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-1 w-12">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {item.rating || '-'}
            </span>
          </div>
          
          <div className="w-20 text-xs text-zinc-500 capitalize">
            {item.status === 'backlog' ? t('toDo', language) : item.status === 'in-progress' ? t('doing', language) : item.status === 'completed' ? t('done', language) : t('rewatch', language)}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(t('deleteConfirm', language))) {
                deleteItem(item.id);
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title={t('deleteConfirm', language)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
