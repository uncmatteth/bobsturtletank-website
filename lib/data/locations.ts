export interface Location {
  id: string;
  name: string;
  region: string;
  terrainType: string;
  chapters: number[];
  description: string;
  mapType: 'top-down' | 'sidescroller';
  tilesetStyle: string;
  coordinates: {
    x: number;
    y: number;
  };
  specialFeatures: string[];
  connectedTo: string[];
  tilesetImage?: string;
}

export const adventureRealmLocations: Location[] = [
  {
    id: 'cedar-hollow',
    name: 'Cedar Hollow',
    region: 'Starting Zone',
    terrainType: 'Village/Forest',
    chapters: [1, 2],
    description: 'Remote village surrounded by Iron Mountains - Matt\'s starting home. Thatched cottages with smoke drifting from chimneys, a bustling market square, and the tanner\'s shop. This is where Uncle Matt lived for twenty summers before his journey began.',
    mapType: 'top-down',
    tilesetStyle: 'Grass to Forest',
    coordinates: { x: 0, y: 0 },
    specialFeatures: ['Thatched cottages', 'Market square', 'Willow Woods nearby', 'Uncle Matt\'s cottage'],
    connectedTo: ['willow-woods', 'morning-meadows'],
    tilesetImage: '/tilesets/topdown/grass-to-forest.png',
  },
  {
    id: 'willow-woods',
    name: 'Willow Woods',
    region: 'Starting Zone',
    terrainType: 'Forest',
    chapters: [1],
    description: 'Tranquil forest with playful sunlight dancing overhead. Birds trill merrily in the treetops, squirrels chatter gossip, and the sheltering canopy creates a magical atmosphere for Matt\'s journey.',
    mapType: 'top-down',
    tilesetStyle: 'Grass to Forest',
    coordinates: { x: 1, y: 0 },
    specialFeatures: ['Dense canopy', 'Wildlife', 'Shaded trails', 'Bird songs'],
    connectedTo: ['cedar-hollow', 'morning-meadows'],
    tilesetImage: '/tilesets/topdown/grass-to-forest.png',
  },
  {
    id: 'morning-meadows',
    name: 'Morning Meadows',
    region: 'Starting Zone',
    terrainType: 'Grassland',
    chapters: [1],
    description: 'Sun-kissed grassy meadows where Matt first meets Bob the Magical Talking Turtle! A sheltered dell with a babbling brook and wildflowers. This is where the greatest adventure begins.',
    mapType: 'top-down',
    tilesetStyle: 'Grass to Forest',
    coordinates: { x: 2, y: 0 },
    specialFeatures: ['Sheltered dell', 'Babbling brook', 'Wildflowers', 'First encounter with Bob!'],
    connectedTo: ['willow-woods', 'iron-mountains'],
    tilesetImage: '/tilesets/topdown/grass-to-forest.png',
  },
  {
    id: 'desert-of-echoes',
    name: 'Desert of Echoes',
    region: 'Late Journey',
    terrainType: 'Desert',
    chapters: [40],
    description: 'Remote desert valley concealing occult secrets - the Desolation. Sun-scorched dunes stretching to the horizon under twin suns. Mirages and echoes deceive all who enter, luring souls to their doom amid endless seas of sand.',
    mapType: 'top-down',
    tilesetStyle: 'Sand to Rock',
    coordinates: { x: 10, y: 5 },
    specialFeatures: ['Twin suns', 'Mirages', 'Endless sand', 'Ancient secrets', 'Occult mysteries'],
    connectedTo: ['cerulean-sea', 'lushwood'],
    tilesetImage: '/tilesets/topdown/sand-to-rock.png',
  },
  {
    id: 'the-labyrinth',
    name: 'The Labyrinth',
    region: 'Mid Journey',
    terrainType: 'Dungeon',
    chapters: [34],
    description: 'Hulking stone labyrinth rising from a barren valley. Deadly shifting trials with cryptic symbols and ancient magic guard the radiant heart within. A test of courage and wisdom.',
    mapType: 'sidescroller',
    tilesetStyle: 'Stone Platform',
    coordinates: { x: 5, y: 2 },
    specialFeatures: ['Deadly trials', 'Cryptic symbols', 'Ancient magic', 'Radiant heart treasure'],
    connectedTo: ['barren-valley'],
    tilesetImage: '/tilesets/sidescroller/stone-platform.png',
  },
  {
    id: 'fimbul-peaks',
    name: 'Fimbul Peaks',
    region: 'Late Journey',
    terrainType: 'Mountains',
    chapters: [35],
    description: 'Jagged ice-fanged summits clawing the heavens. Storm-faced and aloof, these frozen mountains dominate the horizon with killing cold and snow plumes whipping skyward. Only the hardened in body and spirit survive the passage.',
    mapType: 'sidescroller',
    tilesetStyle: 'Wooden Snow Platform',
    coordinates: { x: 12, y: 6 },
    specialFeatures: ['Ice-fanged peaks', 'Killing cold', 'Snow plumes', 'Ancient rams', 'Storm-faced mountains'],
    connectedTo: ['mountain-ascent'],
    tilesetImage: '/tilesets/sidescroller/wooden-snow.png',
  },
  {
    id: 'metropolis',
    name: 'Metropolis - City of Dreams',
    region: 'Mid Journey',
    terrainType: 'City',
    chapters: [24],
    description: 'Great city of legend with towering skyscrapers glinting amidst concrete. Curving neon signs, street performers, and illusion artists create a wonderland of creativity and danger.',
    mapType: 'top-down',
    tilesetStyle: 'Urban Concrete',
    coordinates: { x: 6, y: 3 },
    specialFeatures: ['Skyscrapers', 'Neon signs', 'Street performers', 'Illusion artists', 'Urban chaos'],
    connectedTo: ['celebration-isle', 'groove-glades'],
  },
  {
    id: 'lushwood',
    name: 'Lushwood - Verdant Sanctum',
    region: 'Late Journey',
    terrainType: 'Forest',
    chapters: [41],
    description: 'Verdant sanctum with thriving forests of pine, hemlock, oak and maple. Ancient trees close overhead creating dappled splendor. The eternal cadence of growth and decay, sanctified by sacred silence.',
    mapType: 'top-down',
    tilesetStyle: 'Dense Forest',
    coordinates: { x: 11, y: 4 },
    specialFeatures: ['Ancient pines', 'Dappled sunlight', 'Sacred silence', 'Primeval wild'],
    connectedTo: ['desert-of-echoes', 'foothills'],
  },
  {
    id: 'algorithmic-abyss',
    name: 'Algorithmic Abyss',
    region: 'Digital Realm',
    terrainType: 'Cyber Space',
    chapters: [38],
    description: 'Tangled cyber expanse where logic and chaos coexist. Fractal platforms and prismatic pathways float in endless void. Towers of cryptographic code stacked in labyrinthine arrays with glitching rivers of numbers.',
    mapType: 'sidescroller',
    tilesetStyle: 'Digital Glitch',
    coordinates: { x: 20, y: 10 },
    specialFeatures: ['Fractal platforms', 'Code towers', 'Glitching rivers', 'Cryptographic labyrinths'],
    connectedTo: ['trivia-terrain'],
  },
  {
    id: 'library-of-light',
    name: 'Library of the Ages',
    region: 'Cosmic Realm',
    terrainType: 'Ancient Library',
    chapters: [61],
    description: 'Endless subterranean library in Levitaria with crystalline staircases. Cosmic history encoded in shimmering photons and quantum filaments. The collected arcana of the cosmos lies open here.',
    mapType: 'sidescroller',
    tilesetStyle: 'Crystal Library',
    coordinates: { x: 25, y: 15 },
    specialFeatures: ['Crystalline staircases', 'Photon lattices', 'Cosmic history', 'Quantum filaments'],
    connectedTo: ['levitaria'],
  },
];

export function getAllLocations(): Location[] {
  return adventureRealmLocations;
}

export function getLocationById(id: string): Location | undefined {
  return adventureRealmLocations.find(loc => loc.id === id);
}

export function getLocationsByRegion(region: string): Location[] {
  return adventureRealmLocations.filter(loc => loc.region === region);
}

export function getLocationsByChapter(chapter: number): Location[] {
  return adventureRealmLocations.filter(loc => loc.chapters.includes(chapter));
}
