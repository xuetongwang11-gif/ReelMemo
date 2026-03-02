import { GoogleGenAI, Type } from '@google/genai';
import { MediaItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractMediaInfo(input: string): Promise<Partial<MediaItem>> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract media information from the following input (could be a URL, title, or ISBN). 
      Return the data in JSON format.
      Input: ${input}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'The title of the movie, book, or TV show.' },
            type: { type: Type.STRING, description: 'Must be one of: movie, book, tv' },
            directorOrAuthor: { type: Type.STRING, description: 'The director (for movies/tv) or author (for books).' },
            genre: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of genres.' },
            summary: { type: Type.STRING, description: 'A brief summary or plot description.' },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 mood or aesthetic tags (e.g., #Cyberpunk, #Melancholy, #SummerVibes).' },
            coverUrl: { type: Type.STRING, description: 'A valid image URL for the cover/poster. If you cannot find one, return an empty string.' }
          },
          required: ['title', 'type', 'directorOrAuthor', 'genre', 'summary', 'tags']
        },
        systemInstruction: 'You are an expert media curator. Your job is to extract accurate information about books, movies, and TV shows and categorize them with aesthetic, mood-based tags.'
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data;
    }
    return {};
  } catch (error) {
    console.error('Error extracting media info:', error);
    throw error;
  }
}

export async function polishReview(draft: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Polish the following rough notes into a beautifully written, concise short review (under 100 words). Keep the original sentiment but make it sound more poetic and structured.
      
      Draft: ${draft}`,
      config: {
        systemInstruction: 'You are a literary and film critic known for your evocative, poetic, and concise writing style.'
      }
    });

    return response.text || draft;
  } catch (error) {
    console.error('Error polishing review:', error);
    return draft;
  }
}
