/**
 * Tile - Represents a single tile in the game map
 * Handles tile properties, appearance, and behavior
 */

export type TileType = 
  'floor' | 'wall' | 'stairs' | 'door' | 'water' | 'lava' | 'void' | 
  'trap' | 'treasure_floor' | 'boss_floor';

interface TileAppearance {
  char: string;
  fg: string;
  bg: string;
}

export class Tile {
  private type: TileType;
  private walkable: boolean;
  private transparent: boolean;
  private appearance: TileAppearance;
  private discovered: boolean = false;
  private special: boolean = false;
  
  // Tile appearance definitions
  private static tileDefinitions: { [key in TileType]: {
    walkable: boolean;
    transparent: boolean;
    appearance: TileAppearance;
    special: boolean;
  }} = {
    floor: {
      walkable: true,
      transparent: true,
      appearance: { char: '.', fg: '#BBBBBB', bg: '#222222' },
      special: false
    },
    wall: {
      walkable: false,
      transparent: false,
      appearance: { char: '#', fg: '#777777', bg: '#333333' },
      special: false
    },
    stairs: {
      walkable: true,
      transparent: true,
      appearance: { char: '>', fg: '#FFFFFF', bg: '#222222' },
      special: true
    },
    door: {
      walkable: true,
      transparent: false,
      appearance: { char: '+', fg: '#FFCC00', bg: '#222222' },
      special: true
    },
    water: {
      walkable: true,
      transparent: true,
      appearance: { char: '~', fg: '#3333FF', bg: '#222266' },
      special: true
    },
    lava: {
      walkable: false,
      transparent: true,
      appearance: { char: '~', fg: '#FF3300', bg: '#661100' },
      special: true
    },
    void: {
      walkable: false,
      transparent: true,
      appearance: { char: ' ', fg: '#000000', bg: '#000000' },
      special: true
    },
    trap: {
      walkable: true,
      transparent: true,
      appearance: { char: '^', fg: '#FF0000', bg: '#222222' },
      special: true
    },
    treasure_floor: {
      walkable: true,
      transparent: true,
      appearance: { char: '.', fg: '#FFCC00', bg: '#222222' },
      special: true
    },
    boss_floor: {
      walkable: true,
      transparent: true,
      appearance: { char: '.', fg: '#FF0000', bg: '#331111' },
      special: true
    }
  };
  
  constructor(type: TileType) {
    this.type = type;
    
    // Get properties from definitions
    const definition = Tile.tileDefinitions[type];
    this.walkable = definition.walkable;
    this.transparent = definition.transparent;
    this.appearance = { ...definition.appearance };
    this.special = definition.special;
  }
  
  /**
   * Get the tile type
   */
  public getType(): TileType {
    return this.type;
  }
  
  /**
   * Check if the tile is walkable
   */
  public isWalkable(): boolean {
    return this.walkable;
  }
  
  /**
   * Check if the tile is transparent (for FOV)
   */
  public isTransparent(): boolean {
    return this.transparent;
  }
  
  /**
   * Get the appearance of the tile
   */
  public getAppearance(): TileAppearance {
    return { ...this.appearance };
  }
  
  /**
   * Check if the tile is a wall
   */
  public isWall(): boolean {
    return this.type === 'wall';
  }
  
  /**
   * Check if the tile is stairs
   */
  public isStairs(): boolean {
    return this.type === 'stairs';
  }
  
  /**
   * Check if the tile is a door
   */
  public isDoor(): boolean {
    return this.type === 'door';
  }
  
  /**
   * Check if the tile is a special tile
   */
  public isSpecial(): boolean {
    return this.special;
  }
  
  /**
   * Mark the tile as discovered
   */
  public discover(): void {
    this.discovered = true;
  }
  
  /**
   * Check if the tile has been discovered
   */
  public isDiscovered(): boolean {
    return this.discovered;
  }
  
  /**
   * Serialize tile data for saving
   */
  public serialize(): any {
    return {
      type: this.type,
      walkable: this.walkable,
      transparent: this.transparent,
      appearance: this.appearance,
      discovered: this.discovered,
      special: this.special
    };
  }
  
  /**
   * Deserialize tile data for loading
   */
  public deserialize(data: any): void {
    this.type = data.type;
    this.walkable = data.walkable;
    this.transparent = data.transparent;
    this.appearance = data.appearance;
    this.discovered = data.discovered;
    this.special = data.special;
  }
}
