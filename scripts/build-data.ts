import { readFileSync, writeFileSync } from 'fs';

console.log('🔨 Building data files (FIXED - ALL ENTRIES)...\n');

// Read CSV file
const csvContent = readFileSync('data/source/book_consistency_tracker.csv', 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Parse header
const header = lines[0].split(',');
console.log(`Header columns (${header.length}):`, header);

// Parse all rows (skip header)
const allEntries = lines.slice(1).map((line, index) => {
  // Split by comma but handle quoted fields
  const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
  const cleaned = fields.map(f => f.replace(/^"|"$/g, '').trim());
  
  // Map to object
  const entry: any = {};
  header.forEach((col, i) => {
    entry[col] = cleaned[i] || '';
  });
  
  return entry;
});

console.log(`\nTotal entries parsed: ${allEntries.length}`);

// Filter valid entries (not empty, not headers)
const validEntries = allEntries.filter(e => 
  e.Name && 
  e.Category && 
  e.Name !== 'Name' &&
  !e.Name.includes('---')
);

console.log(`Valid entries: ${validEntries.length}\n`);

// Group by category
const categories = [...new Set(validEntries.map(e => e.Category))];
console.log('Categories found:', categories);

// Process each category
const characters = validEntries
  .filter(e => e.Category === 'Characters')
  .map(e => ({
    name: e.Name,
    subcategory: e.Subcategory || 'Other',
    firstAppearance: e.First_Appearance_Chapter || 'Unknown',
    description: e.Description || '',
    status: e.Current_Status || '',
    relationships: e.Relationships || '',
    notes: e.Notes || '',
  }));

const artifacts = validEntries
  .filter(e => e.Category === 'Artifacts')
  .map(e => ({
    name: e.Name,
    subcategory: e.Subcategory || 'Other',
    firstAppearance: e.First_Appearance_Chapter || 'Unknown',
    description: e.Description || '',
    owner: e.Owner_User || 'None',
    notes: e.Notes || '',
  }));

const locations = validEntries
  .filter(e => e.Category === 'Locations')
  .map(e => ({
    name: e.Name,
    subcategory: e.Subcategory || 'Other',
    firstAppearance: e.First_Appearance_Chapter || 'Unknown',
    description: e.Description || '',
    notes: e.Notes || '',
  }));

// Handle spaceship components as special artifacts
const spaceshipComponents = validEntries
  .filter(e => e.Category === 'Spaceship')
  .map(e => ({
    name: e.Name,
    subcategory: 'Spaceship Component',
    firstAppearance: e.First_Appearance_Chapter || '50',
    description: e.Description || '',
    owner: 'Cosmos Cruiser',
    notes: e.Notes || '',
  }));

// Combine artifacts with spaceship components
const allArtifacts = [...artifacts, ...spaceshipComponents];

// Write JSON files
writeFileSync('data/characters.json', JSON.stringify(characters, null, 2));
writeFileSync('data/artifacts.json', JSON.stringify(allArtifacts, null, 2));
writeFileSync('data/locations.json', JSON.stringify(locations, null, 2));

console.log('\n✅ Generated data files:');
console.log(`   - characters.json (${characters.length} characters)`);
console.log(`   - artifacts.json (${allArtifacts.length} artifacts including ${spaceshipComponents.length} spaceship components)`);
console.log(`   - locations.json (${locations.length} locations)`);
console.log(`\nTotal items: ${characters.length + allArtifacts.length + locations.length}`);
console.log('🎉 Build complete!');
