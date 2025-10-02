import artifactsData from '@/data/artifacts.json';

export interface Artifact {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  owner: string;
  notes: string;
}

export function getAllArtifacts(): Artifact[] {
  return artifactsData as Artifact[];
}

export function getArtifact(name: string): Artifact | undefined {
  return getAllArtifacts().find(a => 
    a.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
  );
}

export function searchArtifacts(query: string): Artifact[] {
  const lowerQuery = query.toLowerCase();
  return getAllArtifacts().filter(a =>
    a.name.toLowerCase().includes(lowerQuery) ||
    a.description.toLowerCase().includes(lowerQuery) ||
    a.notes.toLowerCase().includes(lowerQuery)
  );
}

