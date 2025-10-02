// ALL 143 locations from the entire book - every place mentioned
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface RealLocation {
  name: string;
  chapters: string;
  first_chapter: number;
  appearances: number;
  terrain: string;
  description: string;
  mapFile: string;
}

let cachedLocations: RealLocation[] | null = null;

export function getAllRealLocations(): RealLocation[] {
  if (cachedLocations) {
    return cachedLocations;
  }

  const csvPath = path.join(process.cwd(), 'data', 'all_locations_comprehensive.csv');
  const fileContents = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  });

  const locations = records.map((record: any) => {
    const safeName = record.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/'/g, '')
      .replace(/,/g, '')
      .replace(/!/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .substring(0, 50);
    
    return {
      name: record.name,
      chapters: record.chapters,
      first_chapter: parseInt(record.first_chapter),
      appearances: parseInt(record.appearances),
      terrain: record.terrain,
      description: record.description || `Appears in Chapter ${record.first_chapter}`,
      mapFile: `${safeName}.png`,
    };
  });

  // Sort by first appearance
  locations.sort((a: RealLocation, b: RealLocation) => a.first_chapter - b.first_chapter);
  
  cachedLocations = locations;
  return cachedLocations;
}

export function getMajorLocations(): RealLocation[] {
  const locations = getAllRealLocations();
  return locations.filter(loc => loc.appearances >= 3);
}

export function getLocationsByTerrain(terrain: string): RealLocation[] {
  const locations = getAllRealLocations();
  return locations.filter(loc => loc.terrain === terrain);
}

export function getLocationByName(name: string): RealLocation | undefined {
  const locations = getAllRealLocations();
  return locations.find(loc => loc.name === name);
}

