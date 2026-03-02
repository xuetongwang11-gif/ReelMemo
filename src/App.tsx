import { useState } from 'react';
import { AppProvider } from './store';
import { Gallery } from './components/Gallery';
import { MagicIntake } from './components/MagicIntake';
import { Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-paper dark:bg-ink text-ink dark:text-paper selection:bg-zinc-500/30">
        <Gallery />

        {/* Floating Action Button */}
        <button
          onClick={() => setIsIntakeOpen(true)}
          className="fixed bottom-8 right-8 z-40 group flex items-center justify-center w-14 h-14 bg-ink dark:bg-paper text-paper dark:text-ink rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/30"
          aria-label="Add new memory"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-500 to-zinc-800 dark:from-zinc-200 dark:to-zinc-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-ink dark:bg-paper text-paper dark:text-ink text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap flex items-center gap-1.5 shadow-xl">
            <Sparkles className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            Magic Intake
          </div>
        </button>

        <MagicIntake 
          isOpen={isIntakeOpen} 
          onClose={() => setIsIntakeOpen(false)} 
        />
      </div>
    </AppProvider>
  );
}
