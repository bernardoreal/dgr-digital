import { get, set } from 'idb-keyval';
import { DGR_CHAPTERS } from '../constants';
import { DGRChapter } from '../types';

const DB_VERSION_KEY = 'iata_dgr_version_2026';

// Remove non-serializable React components (icons) before storing
const serializeChapters = (chapters: DGRChapter[]): DGRChapter[] => {
  return chapters.map(c => {
    const { icon, ...rest } = c;
    return rest;
  });
};

// Re-attach icons from constants
const deserializeChapters = (storedChapters: DGRChapter[]): DGRChapter[] => {
  return storedChapters.map(c => {
    const orig = DGR_CHAPTERS.find(origC => origC.id === c.id);
    return {
      ...c,
      icon: orig ? orig.icon : undefined
    };
  });
};

export async function bootstrapIndexedDB(): Promise<DGRChapter[]> {
  try {
    const version = await get('db_version');
    
    // If not cached or version changed, populate IndexedDB
    if (version !== DB_VERSION_KEY) {
      await set('dgr_chapters', serializeChapters(DGR_CHAPTERS));
      await set('db_version', DB_VERSION_KEY);
      return DGR_CHAPTERS;
    }

    // Load from IndexedDB
    const cachedChapters = await get('dgr_chapters');
    if (cachedChapters) {
      return deserializeChapters(cachedChapters as DGRChapter[]);
    }

    // Fallback
    return DGR_CHAPTERS;
  } catch (error) {
    console.warn("IndexedDB bootstrap failed, falling back to in-memory constants", error);
    return DGR_CHAPTERS;
  }
}

