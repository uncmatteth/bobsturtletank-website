import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { join } from 'path';
import matter from 'gray-matter';

interface CSVEntry {
  Category: string;
  Subcategory: string;
  Name: string;
  First_Appearance_Chapter: string;
  Description: string;
  Current_Status: string;
  Owner_User: string;
  Relationships: string;
  Cross_References: string;
  Notes: string;
  Last_Updated: string;
}

interface Character {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  status: string;
  relationships: string;
  notes: string;
}

interface Artifact {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  owner: string;
  notes: string;
}

interface Location {
  name: string;
  subcategory: string;
  firstAppearance: string;
  description: string;
  notes: string;
}

interface Chapter {
  number: number;
  title: string;
  slug: string;
  filename: string;
  wordCount: number;
}

console.log('🔨 Building data files...\n');

// Parse CSV
const csvContent = readFileSync('data/source/book_consistency_tracker.csv', 'utf-8');
const records: CSVEntry[] = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
  quote: '"',
  escape: '"',
});

// Filter out empty rows
const validRecords = records.filter(r => 
  r.Name && r.Category
);

// Process characters
const characters: Character[] = validRecords
  .filter(r => r.Category === 'Characters')
  .map(r => ({
    name: r.Name,
    subcategory: r.Subcategory,
    firstAppearance: r.First_Appearance_Chapter,
    description: r.Description,
    status: r.Current_Status,
    relationships: r.Relationships,
    notes: r.Notes,
  }));

// Process artifacts
const artifacts: Artifact[] = validRecords
  .filter(r => r.Category === 'Artifacts')
  .map(r => ({
    name: r.Name,
    subcategory: r.Subcategory,
    firstAppearance: r.First_Appearance_Chapter,
    description: r.Description,
    owner: r.Owner_User,
    notes: r.Notes,
  }));

// Process locations
const locations: Location[] = validRecords
  .filter(r => r.Category === 'Locations')
  .map(r => ({
    name: r.Name,
    subcategory: r.Subcategory,
    firstAppearance: r.First_Appearance_Chapter,
    description: r.Description,
    notes: r.Notes,
  }));

// Process chapters
const chapterFiles = readdirSync('content/chapters/COMPLETED CHAPTERS')
  .filter(f => f.startsWith('Chapter') && f.endsWith('.md') && !f.includes('Part'));

const chapters: Chapter[] = chapterFiles
  .map(filename => {
    const content = readFileSync(join('content/chapters/COMPLETED CHAPTERS', filename), 'utf-8');
    const { content: text } = matter(content);
    
    // Extract chapter number and title
    const firstLine = content.split('\n')[0];
    const match = firstLine.match(/Chapter (\d+):?\s*(.+)/i);
    
    if (!match) return null;
    
    const number = parseInt(match[1], 10);
    const title = match[2].trim();
    
    return {
      number,
      title,
      slug: `chapter-${number}`,
      filename,
      wordCount: text.split(/\s+/).length,
    };
  })
  .filter(Boolean)
  .sort((a, b) => (a?.number ?? 0) - (b?.number ?? 0)) as Chapter[];

// Write JSON files
writeFileSync('data/characters.json', JSON.stringify(characters, null, 2));
writeFileSync('data/artifacts.json', JSON.stringify(artifacts, null, 2));
writeFileSync('data/locations.json', JSON.stringify(locations, null, 2));
writeFileSync('data/chapters.json', JSON.stringify(chapters, null, 2));

console.log('✅ Generated data files:');
console.log(`   - characters.json (${characters.length} characters)`);
console.log(`   - artifacts.json (${artifacts.length} artifacts)`);
console.log(`   - locations.json (${locations.length} locations)`);
console.log(`   - chapters.json (${chapters.length} chapters)\n`);
console.log('🎉 Build complete!');
