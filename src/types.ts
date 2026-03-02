export type MediaType = 'movie' | 'book' | 'tv';
export type MediaStatus = 'backlog' | 'in-progress' | 'completed' | 'rewatch';

export interface RewatchRecord {
  id: string;
  date: string;
  review: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  coverUrl: string;
  directorOrAuthor: string;
  genre: string[];
  status: MediaStatus;
  startDate?: string;
  endDate?: string;
  progress: number; // 0-100
  rating: number; // 1-5
  tags: string[]; // AI generated mood tags
  quotes: string[];
  review: string;
  summary: string;
  rewatchCount?: number;
  rewatches?: RewatchRecord[];
  createdAt: string;
  updatedAt: string;
}
