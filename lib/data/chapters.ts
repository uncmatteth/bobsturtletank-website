import chaptersData from '@/data/chapters.json';
import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export interface Chapter {
  number: number;
  title: string;
  slug: string;
  filename: string;
  wordCount: number;
}

export function getAllChapters(): Chapter[] {
  return chaptersData as Chapter[];
}

export function getChapter(number: number): Chapter | undefined {
  return getAllChapters().find(c => c.number === number);
}

export function getChapterContent(number: number): { content: string; data: any } | null {
  const chapter = getChapter(number);
  if (!chapter) return null;
  
  const filePath = join(process.cwd(), 'content', 'chapters', 'COMPLETED CHAPTERS', chapter.filename);
  const fileContent = readFileSync(filePath, 'utf-8');
  return matter(fileContent);
}

export function getPrevNextChapters(currentNumber: number): { prev: Chapter | null; next: Chapter | null } {
  const chapters = getAllChapters();
  const currentIndex = chapters.findIndex(c => c.number === currentNumber);
  
  return {
    prev: currentIndex > 0 ? chapters[currentIndex - 1] : null,
    next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
  };
}
