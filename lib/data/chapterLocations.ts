// All 69 chapter locations from the book
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface Chapter {
  name: string;
  chapters: string;
  first_chapter: number;
  appearances: number;
  terrain: string;
  description: string;
  mapFile: string;
}

let cachedChapters: Chapter[] | null = null;

export function getAllChapters(): Chapter[] {
  if (cachedChapters) {
    return cachedChapters;
  }

  const csvPath = path.join(process.cwd(), 'data', 'all_chapters_locations.csv');
  const fileContents = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  });

  cachedChapters = records.map((record: any) => {
    const chapterNum = parseInt(record.first_chapter);
    const safeName = record.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/'/g, '')
      .replace(/!/g, '')
      .replace(/,/g, '')
      .substring(0, 40);
    
    return {
      name: record.name,
      chapters: record.chapters,
      first_chapter: chapterNum,
      appearances: parseInt(record.appearances),
      terrain: record.terrain,
      description: record.description || `Chapter ${chapterNum}: ${record.name}`,
      mapFile: `chapter${chapterNum.toString().padStart(2, '0')}-${safeName}.png`,
    };
  });

  // Sort by chapter number
  cachedChapters.sort((a, b) => a.first_chapter - b.first_chapter);

  return cachedChapters;
}

export function getChapterByNumber(chapterNum: number): Chapter | undefined {
  const chapters = getAllChapters();
  return chapters.find(ch => ch.first_chapter === chapterNum);
}

export function getChaptersByTerrain(terrain: string): Chapter[] {
  const chapters = getAllChapters();
  return chapters.filter(ch => ch.terrain === terrain);
}

export function getMilestoneChapters(): Chapter[] {
  const chapters = getAllChapters();
  return chapters.filter(ch => 
    ch.first_chapter % 10 === 0 || 
    ch.first_chapter === 1 || 
    ch.first_chapter === 69
  );
}

