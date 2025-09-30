import { MetadataRoute } from 'next';
import { getAllChapters } from '@/lib/data/chapters';
import { getAllCharacters } from '@/lib/data/characters';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bobsturtletank.fun';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/games',
    '/games/bounce',
    '/games/roguelike',
    '/games/leaderboard',
    '/book',
    '/book/characters',
    '/book/artifacts',
    '/book/locations',
    '/book/chapters',
    '/book/trivia',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Chapter pages
  const chapters = getAllChapters();
  const chapterPages = chapters.map(chapter => ({
    url: `${baseUrl}/book/chapters/${chapter.number}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Character detail pages
  const characters = getAllCharacters();
  const characterPages = characters.map(character => ({
    url: `${baseUrl}/book/characters/${character.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...chapterPages, ...characterPages];
}
