import locationsData from '@/data/locations.json';

export interface Location {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  notes: string;
}

export function getAllLocations(): Location[] {
  return locationsData as Location[];
}

export function getLocation(name: string): Location | undefined {
  return getAllLocations().find(l => 
    l.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
}

export function searchLocations(query: string): Location[] {
  const lowerQuery = query.toLowerCase();
  return getAllLocations().filter(l =>
    l.name.toLowerCase().includes(lowerQuery) ||
    l.description.toLowerCase().includes(lowerQuery) ||
    l.notes.toLowerCase().includes(lowerQuery)
  );
}
