import { MetadataRoute } from 'next';
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
    '/book/buy',
    '/book/characters',
    '/book/artifacts',
    '/book/locations',
    '/book/trivia',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Character detail pages
  const characters = getAllCharacters();
  const characterPages = characters.map(character => ({
    url: `${baseUrl}/book/characters/${character.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...characterPages];
}
