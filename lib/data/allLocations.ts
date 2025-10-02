// All 91 Adventure Realm locations from the 69 chapters
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface Location {
  name: string;
  chapters: string;
  first_chapter: number;
  appearances: number;
  terrain: string;
  description: string;
  mapFile?: string;
}

let cachedLocations: Location[] | null = null;

export function getAllLocations(): Location[] {
  if (cachedLocations) {
    return cachedLocations;
  }

  const csvPath = path.join(process.cwd(), 'data', 'all_locations_complete.csv');
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
      .substring(0, 50);
    
    return {
      name: record.name,
      chapters: record.chapters,
      first_chapter: parseInt(record.first_chapter),
      appearances: parseInt(record.appearances),
      terrain: record.terrain,
      description: record.description || `Explore ${record.name} from Chapter ${record.first_chapter}`,
      mapFile: `${safeName}.png`,
    };
  });

  cachedLocations = locations;
  return locations;
}

export function getLocationByName(name: string): Location | undefined {
  const locations = getAllLocations();
  return locations.find(loc => loc.name === name);
}

export function getLocationsByTerrain(terrain: string): Location[] {
  const locations = getAllLocations();
  return locations.filter(loc => loc.terrain === terrain);
}

export function getMajorLocations(): Location[] {
  const locations = getAllLocations();
  return locations.filter(loc => loc.appearances >= 3);
}

