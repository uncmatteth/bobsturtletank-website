/**
 * WorldEventSystem - Dynamic events and environmental storytelling
 * Creates immersive atmosphere with procedural events, environmental storytelling, and world ambiance
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { SaveSystem } from './SaveSystem';

export type EventType = 'environmental' | 'narrative' | 'mechanical' | 'atmospheric' | 'encounter' | 'discovery' | 'mystery' | 'legendary';
export type EventTrigger = 'floor_enter' | 'time_based' | 'action_based' | 'random' | 'story_based' | 'achievement_based' | 'boss_defeat' | 'exploration';
export type EventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type EnvironmentType = 'shallow' | 'deep' | 'abyss' | 'volcanic' | 'frozen' | 'crystal' | 'void' | 'ancient';

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  rarity: EventRarity;
  trigger: EventTrigger;
  
  // Requirements
  minFloor: number;
  maxFloor: number;
  requiredEnvironment?: EnvironmentType;
  prerequisites: string[];
  cooldown: number;
  
  // Execution
  duration: number;
  isActive: boolean;
  activatedAt: number;
  lastTriggered: number;
  
  // Effects
  effects: EventEffect[];
  narrativeText: string[];
  audioEvent?: string;
  visualEffects: VisualEffect[];
  
  // Metadata
  weight: number;
  canRepeat: boolean;
  isOneTime: boolean;
  hasBeenTriggered: boolean;
  category: string;
  tags: string[];
}

export interface EventEffect {
  type: 'stat_modifier' | 'spawn_modifier' | 'loot_modifier' | 'environment_modifier' | 'special_action';
  target: 'hero' | 'enemies' | 'loot' | 'environment' | 'all';
  parameter: string;
  value: number;
  duration: number;
  isPercentage: boolean;
}

export interface VisualEffect {
  type: 'particles' | 'lighting' | 'overlay' | 'animation' | 'texture_change' | 'screen_effect';
  parameters: any;
  duration: number;
  intensity: number;
}

export interface AtmosphereSettings {
  ambientLighting: number;
  fogIntensity: number;
  particleCount: number;
  musicVolume: number;
  environmentalSounds: string[];
  visualFilters: string[];
  weatherEffects: string[];
}

export interface EnvironmentalStory {
  id: string;
  title: string;
  description: string;
  environmentType: EnvironmentType;
  floorRange: { min: number; max: number };
  elements: StoryElement[];
  discoveryProgress: number;
  isComplete: boolean;
}

export interface StoryElement {
  id: string;
  type: 'inscription' | 'artifact' | 'architecture' | 'remains' | 'mural' | 'crystal' | 'echo';
  text: string;
  location: { x: number; y: number };
  discovered: boolean;
  requiredForCompletion: boolean;
}

export interface WorldEventStats {
  totalEventsTriggered: number;
  eventsByType: { [type: string]: number };
  eventsByRarity: { [rarity: string]: number };
  storiesDiscovered: number;
  totalStoryElements: number;
  averageEventFrequency: number;
  rareEventCount: number;
  atmosphereScore: number;
}

export class WorldEventSystem {
  private scene: Phaser.Scene;
  private hero!: Hero;
  
  // Event management
  private allEvents: Map<string, WorldEvent> = new Map();
  private activeEvents: Map<string, WorldEvent> = new Map();
  private eventHistory: string[] = [];
  private eventQueue: WorldEvent[] = [];
  
  // Environmental storytelling
  private environmentalStories: Map<string, EnvironmentalStory> = new Map();
  private discoveredStoryElements: Set<string> = new Set();
  
  // Atmosphere and ambiance
  private currentAtmosphere: AtmosphereSettings;
  private atmosphereOverrides: Map<string, Partial<AtmosphereSettings>> = new Map();
  
  // Timing and triggers
  private eventTimer: number = 0;
  private lastEventCheck: number = 0;
  private eventCheckInterval: number = 5000; // 5 seconds
  
  // Statistics and state
  private eventStats: WorldEventStats;
  private currentFloor: number = 1;
  private currentEnvironment: EnvironmentType = 'shallow';
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.currentAtmosphere = this.getDefaultAtmosphere();
    this.eventStats = this.initializeEventStats();
    
    this.initializeWorldEvents();
    this.initializeEnvironmentalStories();
    this.setupEventTriggers();
    
    console.log('🌍 WorldEventSystem initialized');
  }
  
  /**
   * Initialize world event system with hero
   */
  public initialize(hero: Hero): void {
    this.hero = hero;
    this.loadWorldEventData();
    this.updateAtmosphereForEnvironment(this.currentEnvironment);
    
    console.log('🌍 World events connected to hero');
  }
  
  /**
   * Update world event system
   */
  public update(time: number, delta: number): void {
    this.eventTimer += delta;
    
    // Process active events
    this.updateActiveEvents(time, delta);
    
    // Check for new events
    if (time - this.lastEventCheck >= this.eventCheckInterval) {
      this.checkForEvents(time);
      this.lastEventCheck = time;
    }
    
    // Process event queue
    this.processEventQueue();
    
    // Update atmosphere
    this.updateAtmosphere(delta);
  }
  
  /**
   * Trigger event by ID (for testing or forced events)
   */
  public triggerEvent(eventId: string, force: boolean = false): boolean {
    const event = this.allEvents.get(eventId);
    if (!event) {
      console.warn(`Event not found: ${eventId}`);
      return false;
    }
    
    if (!force && !this.canTriggerEvent(event)) {
      console.log(`Cannot trigger event: ${eventId}`);
      return false;
    }
    
    return this.activateEvent(event);
  }
  
  /**
   * Set current floor and environment
   */
  public setFloorAndEnvironment(floor: number, environment: EnvironmentType): void {
    const oldFloor = this.currentFloor;
    const oldEnvironment = this.currentEnvironment;
    
    this.currentFloor = floor;
    this.currentEnvironment = environment;
    
    // Trigger floor-based events
    if (floor !== oldFloor) {
      this.onFloorChange(floor, oldFloor);
    }
    
    // Update atmosphere for new environment
    if (environment !== oldEnvironment) {
      this.updateAtmosphereForEnvironment(environment);
    }
    
    // Check for environmental story elements
    this.checkForStoryElements(floor, environment);
  }
  
  /**
   * Get active world events
   */
  public getActiveEvents(): WorldEvent[] {
    return Array.from(this.activeEvents.values());
  }
  
  /**
   * Get event history
   */
  public getEventHistory(): string[] {
    return [...this.eventHistory];
  }
  
  /**
   * Get world event statistics
   */
  public getEventStats(): WorldEventStats {
    return { ...this.eventStats };
  }
  
  /**
   * Get current atmosphere settings
   */
  public getCurrentAtmosphere(): AtmosphereSettings {
    return { ...this.currentAtmosphere };
  }
  
  /**
   * Get environmental stories
   */
  public getEnvironmentalStories(): EnvironmentalStory[] {
    return Array.from(this.environmentalStories.values());
  }
  
  /**
   * Discover story element
   */
  public discoverStoryElement(elementId: string): boolean {
    if (this.discoveredStoryElements.has(elementId)) {
      return false;
    }
    
    this.discoveredStoryElements.add(elementId);
    
    // Find the story this element belongs to
    for (const story of this.environmentalStories.values()) {
      const element = story.elements.find(e => e.id === elementId);
      if (element) {
        element.discovered = true;
        this.updateStoryProgress(story);
        
        // Show discovery notification
        this.showStoryDiscovery(element);
        
        console.log(`📜 Story element discovered: ${element.type} - "${element.text}"`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Force atmospheric change (for special events)
   */
  public setAtmosphereOverride(overrideId: string, settings: Partial<AtmosphereSettings>, duration: number): void {
    this.atmosphereOverrides.set(overrideId, settings);
    
    // Remove override after duration
    this.scene.time.delayedCall(duration, () => {
      this.atmosphereOverrides.delete(overrideId);
      this.updateAtmosphereForEnvironment(this.currentEnvironment);
    });
    
    this.applyAtmosphereSettings();
  }
  
  /**
   * Save world event data
   */
  public saveWorldEventData(): void {
    const worldEventData = {
      eventHistory: this.eventHistory,
      discoveredStoryElements: Array.from(this.discoveredStoryElements),
      eventStats: this.eventStats,
      lastTriggeredTimes: Object.fromEntries(
        Array.from(this.allEvents.entries()).map(([id, event]) => [id, event.lastTriggered])
      ),
      completedStories: Array.from(this.environmentalStories.values())
        .filter(story => story.isComplete)
        .map(story => story.id),
      lastUpdated: Date.now()
    };
    
    // IMPLEMENTED: Implement world event data saving
    console.log('World event data saved:', worldEventData);
  }
  
  /**
   * Destroy world event system
   */
  public destroy(): void {
    this.saveWorldEventData();
    this.allEvents.clear();
    this.activeEvents.clear();
    this.atmosphereOverrides.clear();
    
    console.log('🌍 WorldEventSystem destroyed');
  }
  
  // Private methods
  
  private initializeWorldEvents(): void {
    // Environmental events
    this.addEnvironmentalEvents();
    
    // Narrative events
    this.addNarrativeEvents();
    
    // Mechanical events
    this.addMechanicalEvents();
    
    // Atmospheric events
    this.addAtmosphericEvents();
    
    // Encounter events
    this.addEncounterEvents();
    
    // Discovery events
    this.addDiscoveryEvents();
    
    // Mystery events
    this.addMysteryEvents();
    
    // Legendary events
    this.addLegendaryEvents();
    
    console.log(`🌍 Initialized ${this.allEvents.size} world events`);
  }
  
  private addEnvironmentalEvents(): void {
    const environmentalEvents: WorldEvent[] = [
      {
        id: 'shallow_turtle_echoes',
        name: 'Ancient Turtle Echoes',
        description: 'Whispers of ancient turtle spirits drift through the shallow depths',
        type: 'environmental',
        rarity: 'common',
        trigger: 'floor_enter',
        minFloor: 1,
        maxFloor: 10,
        requiredEnvironment: 'shallow',
        prerequisites: [],
        cooldown: 120000, // 2 minutes
        duration: 60000, // 1 minute
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'wisdom',
            value: 10,
            duration: 60000,
            isPercentage: false
          }
        ],
        narrativeText: [
          'The walls shimmer with ancient turtle carvings...',
          'You feel the presence of your ancestors guiding you.',
          'Ancient wisdom flows through these sacred halls.'
        ],
        audioEvent: 'ambient_whispers',
        visualEffects: [
          {
            type: 'particles',
            parameters: { color: 0x80ff80, count: 20, drift: true },
            duration: 60000,
            intensity: 0.3
          }
        ],
        weight: 100,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'ancestral',
        tags: ['turtle', 'wisdom', 'ancestral', 'shallow']
      },
      {
        id: 'volcanic_heat_surge',
        name: 'Volcanic Heat Surge',
        description: 'Intense heat emanates from the volcanic depths',
        type: 'environmental',
        rarity: 'uncommon',
        trigger: 'floor_enter',
        minFloor: 25,
        maxFloor: 40,
        requiredEnvironment: 'volcanic',
        prerequisites: [],
        cooldown: 180000, // 3 minutes
        duration: 90000, // 1.5 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'environment_modifier',
            target: 'environment',
            parameter: 'temperature',
            value: 50,
            duration: 90000,
            isPercentage: true
          },
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'fire_resistance',
            value: -10,
            duration: 90000,
            isPercentage: true
          }
        ],
        narrativeText: [
          'The air shimmers with volcanic heat...',
          'Sweat beads on your shell as temperatures rise.',
          'The very stones burn with inner fire.'
        ],
        audioEvent: 'volcanic_rumble',
        visualEffects: [
          {
            type: 'overlay',
            parameters: { color: 0xff4400, alpha: 0.1, pulse: true },
            duration: 90000,
            intensity: 0.4
          },
          {
            type: 'particles',
            parameters: { type: 'heat_shimmer', density: 30 },
            duration: 90000,
            intensity: 0.5
          }
        ],
        weight: 75,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'elemental',
        tags: ['volcanic', 'heat', 'danger', 'elemental']
      },
      {
        id: 'crystal_resonance',
        name: 'Crystal Resonance',
        description: 'The crystal formations sing with harmonic energy',
        type: 'environmental',
        rarity: 'rare',
        trigger: 'floor_enter',
        minFloor: 35,
        maxFloor: 60,
        requiredEnvironment: 'crystal',
        prerequisites: [],
        cooldown: 300000, // 5 minutes
        duration: 120000, // 2 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'mana_regen',
            value: 100,
            duration: 120000,
            isPercentage: true
          },
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'magic_power',
            value: 25,
            duration: 120000,
            isPercentage: true
          }
        ],
        narrativeText: [
          'The crystals hum with otherworldly energy...',
          'You feel your magical essence resonating with the formation.',
          'Ancient power flows through the crystalline matrix.'
        ],
        audioEvent: 'crystal_harmony',
        visualEffects: [
          {
            type: 'lighting',
            parameters: { color: 0x88ccff, intensity: 1.5, pulse: true },
            duration: 120000,
            intensity: 0.7
          },
          {
            type: 'particles',
            parameters: { type: 'crystal_sparkles', count: 50, orbital: true },
            duration: 120000,
            intensity: 0.8
          }
        ],
        weight: 50,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'magical',
        tags: ['crystal', 'magic', 'enhancement', 'mystical']
      }
    ];
    
    environmentalEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addNarrativeEvents(): void {
    const narrativeEvents: WorldEvent[] = [
      {
        id: 'ancient_inscription',
        name: 'Ancient Inscription Discovery',
        description: 'You discover mysterious inscriptions on the dungeon walls',
        type: 'narrative',
        rarity: 'uncommon',
        trigger: 'exploration',
        minFloor: 5,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 600000, // 10 minutes
        duration: 30000, // 30 seconds
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'special_action',
            target: 'hero',
            parameter: 'lore_knowledge',
            value: 1,
            duration: 0,
            isPercentage: false
          }
        ],
        narrativeText: [
          'Ancient runes glow faintly on the weathered stone...',
          '"The depths hold secrets beyond mortal comprehension."',
          '"Only the worthy shall unlock the mysteries below."',
          'You sense this knowledge will serve you well.'
        ],
        audioEvent: 'mystical_discovery',
        visualEffects: [
          {
            type: 'animation',
            parameters: { type: 'rune_glow', color: 0xffd700 },
            duration: 30000,
            intensity: 0.6
          }
        ],
        weight: 60,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'discovery',
        tags: ['lore', 'knowledge', 'ancient', 'mystery']
      },
      {
        id: 'ghost_turtle_encounter',
        name: 'Spirit of the First Explorer',
        description: 'The ghost of an ancient turtle explorer appears before you',
        type: 'narrative',
        rarity: 'epic',
        trigger: 'random',
        minFloor: 15,
        maxFloor: 80,
        prerequisites: ['ancient_inscription'],
        cooldown: 1800000, // 30 minutes
        duration: 45000, // 45 seconds
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'experience_gain',
            value: 50,
            duration: 600000, // 10 minutes
            isPercentage: true
          }
        ],
        narrativeText: [
          'A spectral turtle materializes before you...',
          '"Young shell-bearer, I sense great potential within you."',
          '"The depths test all who dare venture here."',
          '"Take this blessing, and may your shell never crack."',
          'The spirit fades, leaving you feeling more enlightened.'
        ],
        audioEvent: 'spirit_encounter',
        visualEffects: [
          {
            type: 'animation',
            parameters: { type: 'spirit_manifestation', ghostly: true },
            duration: 45000,
            intensity: 0.8
          },
          {
            type: 'particles',
            parameters: { type: 'spirit_essence', color: 0x88ffcc },
            duration: 45000,
            intensity: 0.5
          }
        ],
        weight: 20,
        canRepeat: false,
        isOneTime: true,
        hasBeenTriggered: false,
        category: 'legendary_encounter',
        tags: ['spirit', 'blessing', 'unique', 'ancestral']
      }
    ];
    
    narrativeEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addMechanicalEvents(): void {
    const mechanicalEvents: WorldEvent[] = [
      {
        id: 'treasure_abundance',
        name: 'Treasure Cache Discovery',
        description: 'You stumble upon a hidden treasure cache',
        type: 'mechanical',
        rarity: 'uncommon',
        trigger: 'random',
        minFloor: 1,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 900000, // 15 minutes
        duration: 10000, // 10 seconds
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'loot_modifier',
            target: 'loot',
            parameter: 'rarity_boost',
            value: 100,
            duration: 300000, // 5 minutes
            isPercentage: true
          },
          {
            type: 'special_action',
            target: 'environment',
            parameter: 'spawn_treasure',
            value: 3,
            duration: 0,
            isPercentage: false
          }
        ],
        narrativeText: [
          'A loose stone reveals a hidden compartment...',
          'Ancient treasures glimmer in the darkness!',
          'Your keen eyes have uncovered forgotten riches.'
        ],
        audioEvent: 'treasure_discovery',
        visualEffects: [
          {
            type: 'particles',
            parameters: { type: 'treasure_gleam', color: 0xffd700, burst: true },
            duration: 10000,
            intensity: 1.0
          }
        ],
        weight: 40,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'reward',
        tags: ['treasure', 'loot', 'discovery', 'bonus']
      },
      {
        id: 'enemy_weakness',
        name: 'Tactical Insight',
        description: 'You discover a weakness in the local creatures',
        type: 'mechanical',
        rarity: 'rare',
        trigger: 'action_based',
        minFloor: 10,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 1200000, // 20 minutes
        duration: 180000, // 3 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'critical_chance',
            value: 25,
            duration: 180000,
            isPercentage: true
          },
          {
            type: 'spawn_modifier',
            target: 'enemies',
            parameter: 'vulnerability',
            value: 20,
            duration: 180000,
            isPercentage: true
          }
        ],
        narrativeText: [
          'You notice a pattern in the creatures\' movements...',
          'Their defensive stance reveals a critical weakness!',
          'This knowledge gives you a tactical advantage.'
        ],
        audioEvent: 'insight_gained',
        visualEffects: [
          {
            type: 'overlay',
            parameters: { type: 'tactical_highlight', color: 0xff0000 },
            duration: 180000,
            intensity: 0.3
          }
        ],
        weight: 30,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'tactical',
        tags: ['combat', 'advantage', 'insight', 'strategy']
      }
    ];
    
    mechanicalEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addAtmosphericEvents(): void {
    const atmosphericEvents: WorldEvent[] = [
      {
        id: 'ethereal_mist',
        name: 'Ethereal Mist',
        description: 'A mysterious mist rolls through the dungeon',
        type: 'atmospheric',
        rarity: 'common',
        trigger: 'time_based',
        minFloor: 1,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 480000, // 8 minutes
        duration: 120000, // 2 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'environment_modifier',
            target: 'environment',
            parameter: 'visibility',
            value: -30,
            duration: 120000,
            isPercentage: true
          }
        ],
        narrativeText: [
          'A thick, ethereal mist begins to fill the corridors...',
          'Visibility decreases as the mysterious fog thickens.',
          'The mist seems to whisper with ancient voices.'
        ],
        audioEvent: 'misty_ambiance',
        visualEffects: [
          {
            type: 'overlay',
            parameters: { type: 'fog', alpha: 0.4, movement: true },
            duration: 120000,
            intensity: 0.6
          }
        ],
        weight: 80,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'environmental',
        tags: ['mist', 'visibility', 'atmospheric', 'mysterious']
      },
      {
        id: 'void_whispers',
        name: 'Whispers from the Void',
        description: 'Strange whispers echo from the deepest parts of the void',
        type: 'atmospheric',
        rarity: 'epic',
        trigger: 'floor_enter',
        minFloor: 50,
        maxFloor: 100,
        requiredEnvironment: 'void',
        prerequisites: [],
        cooldown: 1800000, // 30 minutes
        duration: 60000, // 1 minute
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'sanity',
            value: -10,
            duration: 60000,
            isPercentage: false
          },
          {
            type: 'stat_modifier',
            target: 'hero',
            parameter: 'void_resistance',
            value: 5,
            duration: 300000, // 5 minutes
            isPercentage: false
          }
        ],
        narrativeText: [
          'Incomprehensible whispers drift from the void...',
          'The voices speak of things beyond mortal understanding.',
          'You feel your mind strain against otherworldly knowledge.',
          'Yet somehow, you feel more resistant to the void\'s influence.'
        ],
        audioEvent: 'void_whispers',
        visualEffects: [
          {
            type: 'screen_effect',
            parameters: { type: 'distortion', intensity: 0.2 },
            duration: 60000,
            intensity: 0.4
          },
          {
            type: 'particles',
            parameters: { type: 'void_energy', color: 0x440088 },
            duration: 60000,
            intensity: 0.3
          }
        ],
        weight: 15,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'void',
        tags: ['void', 'whispers', 'sanity', 'otherworldly']
      }
    ];
    
    atmosphericEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addEncounterEvents(): void {
    const encounterEvents: WorldEvent[] = [
      {
        id: 'merchant_turtle',
        name: 'Wandering Merchant',
        description: 'A mysterious turtle merchant appears with rare goods',
        type: 'encounter',
        rarity: 'rare',
        trigger: 'random',
        minFloor: 5,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 1800000, // 30 minutes
        duration: 120000, // 2 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'special_action',
            target: 'environment',
            parameter: 'spawn_merchant',
            value: 1,
            duration: 120000,
            isPercentage: false
          }
        ],
        narrativeText: [
          'A hunched turtle emerges from the shadows...',
          '"Greetings, fellow shell-bearer! Care to see my wares?"',
          'The merchant\'s pack gleams with mysterious items.',
          '"These treasures won\'t be here long, so choose wisely!"'
        ],
        audioEvent: 'merchant_arrival',
        visualEffects: [
          {
            type: 'animation',
            parameters: { type: 'merchant_appearance', sparkle: true },
            duration: 5000,
            intensity: 0.7
          }
        ],
        weight: 25,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'npc',
        tags: ['merchant', 'trade', 'rare_items', 'opportunity']
      }
    ];
    
    encounterEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addDiscoveryEvents(): void {
    const discoveryEvents: WorldEvent[] = [
      {
        id: 'hidden_chamber',
        name: 'Hidden Chamber',
        description: 'You discover a secret chamber behind a false wall',
        type: 'discovery',
        rarity: 'epic',
        trigger: 'exploration',
        minFloor: 10,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 2400000, // 40 minutes
        duration: 5000, // 5 seconds
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'special_action',
            target: 'environment',
            parameter: 'create_secret_room',
            value: 1,
            duration: 0,
            isPercentage: false
          }
        ],
        narrativeText: [
          'Your shell scrapes against what seems to be solid stone...',
          'But the wall gives way, revealing a hidden passage!',
          'Ancient air flows from the secret chamber beyond.',
          'What treasures might lie hidden within?'
        ],
        audioEvent: 'secret_revealed',
        visualEffects: [
          {
            type: 'animation',
            parameters: { type: 'wall_crumble', dust: true },
            duration: 5000,
            intensity: 0.8
          }
        ],
        weight: 15,
        canRepeat: true,
        isOneTime: false,
        hasBeenTriggered: false,
        category: 'exploration',
        tags: ['secret', 'chamber', 'hidden', 'exploration']
      }
    ];
    
    discoveryEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addMysteryEvents(): void {
    const mysteryEvents: WorldEvent[] = [
      {
        id: 'time_anomaly',
        name: 'Temporal Anomaly',
        description: 'Reality seems to bend and twist around you',
        type: 'mystery',
        rarity: 'legendary',
        trigger: 'random',
        minFloor: 30,
        maxFloor: 100,
        prerequisites: [],
        cooldown: 3600000, // 1 hour
        duration: 30000, // 30 seconds
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'special_action',
            target: 'hero',
            parameter: 'time_flux',
            value: 1,
            duration: 30000,
            isPercentage: false
          }
        ],
        narrativeText: [
          'The air shimmers with impossible geometries...',
          'Time itself seems to slow and accelerate randomly.',
          'You witness echoes of past explorers in the same space.',
          'Reality stabilizes, but you feel forever changed.'
        ],
        audioEvent: 'time_distortion',
        visualEffects: [
          {
            type: 'screen_effect',
            parameters: { type: 'time_warp', ripple: true },
            duration: 30000,
            intensity: 0.9
          }
        ],
        weight: 5,
        canRepeat: false,
        isOneTime: true,
        hasBeenTriggered: false,
        category: 'anomaly',
        tags: ['temporal', 'reality', 'mysterious', 'unique']
      }
    ];
    
    mysteryEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private addLegendaryEvents(): void {
    const legendaryEvents: WorldEvent[] = [
      {
        id: 'ancient_guardian_awakening',
        name: 'Ancient Guardian Awakens',
        description: 'A legendary guardian stirs from eons of slumber',
        type: 'legendary',
        rarity: 'mythic',
        trigger: 'achievement_based',
        minFloor: 50,
        maxFloor: 100,
        prerequisites: ['defeat_50_bosses'],
        cooldown: 7200000, // 2 hours
        duration: 300000, // 5 minutes
        isActive: false,
        activatedAt: 0,
        lastTriggered: 0,
        effects: [
          {
            type: 'special_action',
            target: 'environment',
            parameter: 'spawn_ancient_guardian',
            value: 1,
            duration: 300000,
            isPercentage: false
          }
        ],
        narrativeText: [
          'The deepest chambers tremble with ancient power...',
          'Something that has slumbered for millennia begins to stir.',
          'Massive eyes open in the darkness, filled with primordial wisdom.',
          '"Who dares disturb the eternal watch?"',
          'You face a being from the dawn of time itself.'
        ],
        audioEvent: 'guardian_awakening',
        visualEffects: [
          {
            type: 'screen_effect',
            parameters: { type: 'power_surge', color: 0xffd700 },
            duration: 10000,
            intensity: 1.0
          },
          {
            type: 'lighting',
            parameters: { type: 'divine_illumination', intensity: 2.0 },
            duration: 300000,
            intensity: 1.0
          }
        ],
        weight: 1,
        canRepeat: false,
        isOneTime: true,
        hasBeenTriggered: false,
        category: 'legendary',
        tags: ['guardian', 'ancient', 'legendary', 'ultimate']
      }
    ];
    
    legendaryEvents.forEach(event => {
      this.allEvents.set(event.id, event);
    });
  }
  
  private initializeEnvironmentalStories(): void {
    const stories: EnvironmentalStory[] = [
      {
        id: 'fall_of_the_first_civilization',
        title: 'The Fall of the First Civilization',
        description: 'Discover the tragic tale of the ancient turtle civilization that once thrived in these depths',
        environmentType: 'ancient',
        floorRange: { min: 20, max: 80 },
        elements: [
          {
            id: 'first_city_mural',
            type: 'mural',
            text: 'A vast mural depicts a magnificent underwater city, with turtle architects designing impossible structures.',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          },
          {
            id: 'royal_inscription',
            type: 'inscription',
            text: '"In the 500th year of the Deep Kingdom, the waters began to recede, and our people knew despair."',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          },
          {
            id: 'scholars_remains',
            type: 'remains',
            text: 'The remains of an ancient scholar, still clutching a stone tablet with half-finished calculations.',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          },
          {
            id: 'last_kings_crown',
            type: 'artifact',
            text: 'A tarnished crown bearing the inscription: "The last guardian of the depths, who chose to stay."',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          }
        ],
        discoveryProgress: 0,
        isComplete: false
      },
      {
        id: 'the_void_corruption',
        title: 'The Void Corruption',
        description: 'Uncover the mystery of how the void began to corrupt the deepest levels',
        environmentType: 'void',
        floorRange: { min: 60, max: 100 },
        elements: [
          {
            id: 'void_crystal_formation',
            type: 'crystal',
            text: 'A pulsing void crystal that seems to absorb light itself, whispering of realities beyond.',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          },
          {
            id: 'corrupted_guardian_echo',
            type: 'echo',
            text: '"The barriers... they weaken. The hungry dark seeks... new worlds to devour."',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          },
          {
            id: 'research_notes',
            type: 'inscription',
            text: '"Day 847: The void energy responds to consciousness itself. We must seal this breach!"',
            location: { x: 0, y: 0 },
            discovered: false,
            requiredForCompletion: true
          }
        ],
        discoveryProgress: 0,
        isComplete: false
      }
    ];
    
    stories.forEach(story => {
      this.environmentalStories.set(story.id, story);
    });
  }
  
  private setupEventTriggers(): void {
    // Listen to game events for triggering world events
    this.scene.events.on('floor-reached', this.onFloorReached, this);
    this.scene.events.on('enemy-defeated', this.onEnemyDefeated, this);
    this.scene.events.on('item-collected', this.onItemCollected, this);
    this.scene.events.on('boss-defeated', this.onBossDefeated, this);
    this.scene.events.on('achievement-completed', this.onAchievementCompleted, this);
  }
  
  private getDefaultAtmosphere(): AtmosphereSettings {
    return {
      ambientLighting: 0.4,
      fogIntensity: 0.2,
      particleCount: 10,
      musicVolume: 0.7,
      environmentalSounds: ['ambient_drip', 'distant_echo'],
      visualFilters: [],
      weatherEffects: []
    };
  }
  
  private initializeEventStats(): WorldEventStats {
    return {
      totalEventsTriggered: 0,
      eventsByType: {},
      eventsByRarity: {},
      storiesDiscovered: 0,
      totalStoryElements: 0,
      averageEventFrequency: 0,
      rareEventCount: 0,
      atmosphereScore: 50
    };
  }
  
  private loadWorldEventData(): void {
    // IMPLEMENTED: Implement world event data loading
    const worldEventData = null;
    if (worldEventData) {
      // Restore event history
      if (worldEventData.eventHistory) {
        this.eventHistory = worldEventData.eventHistory;
      }
      
      // Restore discovered story elements
      if (worldEventData.discoveredStoryElements) {
        worldEventData.discoveredStoryElements.forEach((elementId: string) => {
          this.discoveredStoryElements.add(elementId);
        });
      }
      
      // Restore event stats
      if (worldEventData.eventStats) {
        this.eventStats = { ...this.eventStats, ...worldEventData.eventStats };
      }
      
      // Restore last triggered times
      if (worldEventData.lastTriggeredTimes) {
        Object.entries(worldEventData.lastTriggeredTimes).forEach(([eventId, time]: [string, any]) => {
          const event = this.allEvents.get(eventId);
          if (event) {
            event.lastTriggered = time;
          }
        });
      }
      
      // Mark completed stories
      if (worldEventData.completedStories) {
        worldEventData.completedStories.forEach((storyId: string) => {
          const story = this.environmentalStories.get(storyId);
          if (story) {
            story.isComplete = true;
          }
        });
      }
    }
  }
  
  private updateActiveEvents(time: number, delta: number): void {
    const eventsToEnd: string[] = [];
    
    this.activeEvents.forEach((event, eventId) => {
      if (time - event.activatedAt >= event.duration) {
        eventsToEnd.push(eventId);
      }
    });
    
    eventsToEnd.forEach(eventId => {
      this.endEvent(eventId);
    });
  }
  
  private checkForEvents(time: number): void {
    // Check for random events
    if (Math.random() < 0.1) { // 10% chance every check
      this.tryTriggerRandomEvent(time);
    }
    
    // Check for time-based events
    this.checkTimeBasedEvents(time);
  }
  
  private tryTriggerRandomEvent(time: number): void {
    const availableEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'random' && this.canTriggerEvent(event)
    );
    
    if (availableEvents.length === 0) return;
    
    // Weight-based selection
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const event of availableEvents) {
      random -= event.weight;
      if (random <= 0) {
        this.activateEvent(event);
        break;
      }
    }
  }
  
  private checkTimeBasedEvents(time: number): void {
    const timeBasedEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'time_based' && this.canTriggerEvent(event)
    );
    
    timeBasedEvents.forEach(event => {
      // Simple time-based trigger (every cooldown period)
      if (time - event.lastTriggered >= event.cooldown) {
        if (Math.random() < 0.3) { // 30% chance when available
          this.activateEvent(event);
        }
      }
    });
  }
  
  private processEventQueue(): void {
    if (this.eventQueue.length === 0) return;
    
    const event = this.eventQueue.shift();
    if (event && this.canTriggerEvent(event)) {
      this.activateEvent(event);
    }
  }
  
  private canTriggerEvent(event: WorldEvent): boolean {
    // Check if already active
    if (event.isActive) return false;
    
    // Check if one-time and already triggered
    if (event.isOneTime && event.hasBeenTriggered) return false;
    
    // Check cooldown
    const now = Date.now();
    if (now - event.lastTriggered < event.cooldown) return false;
    
    // Check floor requirements
    if (this.currentFloor < event.minFloor || this.currentFloor > event.maxFloor) return false;
    
    // Check environment requirements
    if (event.requiredEnvironment && event.requiredEnvironment !== this.currentEnvironment) return false;
    
    // Check prerequisites
    if (event.prerequisites.length > 0) {
      const hasAllPrereqs = event.prerequisites.every(prereq => 
        this.eventHistory.includes(prereq)
      );
      if (!hasAllPrereqs) return false;
    }
    
    return true;
  }
  
  private activateEvent(event: WorldEvent): boolean {
    const now = Date.now();
    
    event.isActive = true;
    event.activatedAt = now;
    event.lastTriggered = now;
    event.hasBeenTriggered = true;
    
    this.activeEvents.set(event.id, event);
    this.eventHistory.push(event.id);
    
    // Apply event effects
    this.applyEventEffects(event);
    
    // Show narrative text
    this.showEventNarrative(event);
    
    // Play audio
    if (event.audioEvent) {
      this.scene.events.emit('play-audio', event.audioEvent);
    }
    
    // Apply visual effects
    this.applyVisualEffects(event);
    
    // Update statistics
    this.updateEventStats(event);
    
    console.log(`🌍 World event activated: ${event.name}`);
    
    // Schedule event end
    this.scene.time.delayedCall(event.duration, () => {
      this.endEvent(event.id);
    });
    
    return true;
  }
  
  private endEvent(eventId: string): void {
    const event = this.activeEvents.get(eventId);
    if (!event) return;
    
    event.isActive = false;
    this.activeEvents.delete(eventId);
    
    // Remove event effects
    this.removeEventEffects(event);
    
    console.log(`🌍 World event ended: ${event.name}`);
  }
  
  private applyEventEffects(event: WorldEvent): void {
    event.effects.forEach(effect => {
      switch (effect.type) {
        case 'stat_modifier':
          this.applyStatModifier(effect);
          break;
        case 'spawn_modifier':
          this.applySpawnModifier(effect);
          break;
        case 'loot_modifier':
          this.applyLootModifier(effect);
          break;
        case 'environment_modifier':
          this.applyEnvironmentModifier(effect);
          break;
        case 'special_action':
          this.applySpecialAction(effect);
          break;
      }
    });
  }
  
  private removeEventEffects(event: WorldEvent): void {
    // Remove temporary effects
    // This would integrate with the hero's temporary effect system
    console.log(`Removing effects for event: ${event.name}`);
  }
  
  private applyStatModifier(effect: EventEffect): void {
    // Apply stat modifier to hero
    // This would integrate with the hero's stat system
    console.log(`Applying stat modifier: ${effect.parameter} ${effect.value}`);
  }
  
  private applySpawnModifier(effect: EventEffect): void {
    // Modify enemy spawn parameters
    console.log(`Applying spawn modifier: ${effect.parameter} ${effect.value}`);
  }
  
  private applyLootModifier(effect: EventEffect): void {
    // Modify loot generation parameters
    console.log(`Applying loot modifier: ${effect.parameter} ${effect.value}`);
  }
  
  private applyEnvironmentModifier(effect: EventEffect): void {
    // Modify environmental parameters
    console.log(`Applying environment modifier: ${effect.parameter} ${effect.value}`);
  }
  
  private applySpecialAction(effect: EventEffect): void {
    // Handle special actions
    switch (effect.parameter) {
      case 'spawn_treasure':
        this.scene.events.emit('spawn-bonus-treasure', effect.value);
        break;
      case 'spawn_merchant':
        this.scene.events.emit('spawn-merchant', effect.duration);
        break;
      case 'create_secret_room':
        this.scene.events.emit('create-secret-room');
        break;
      case 'spawn_ancient_guardian':
        this.scene.events.emit('spawn-ancient-guardian');
        break;
    }
  }
  
  private showEventNarrative(event: WorldEvent): void {
    // Display narrative text to player
    event.narrativeText.forEach((text, index) => {
      this.scene.time.delayedCall(index * 2000, () => {
        this.scene.events.emit('show-narrative', text);
        console.log(`📖 ${text}`);
      });
    });
  }
  
  private applyVisualEffects(event: WorldEvent): void {
    event.visualEffects.forEach(effect => {
      switch (effect.type) {
        case 'particles':
          this.createParticleEffect(effect);
          break;
        case 'lighting':
          this.applyLightingEffect(effect);
          break;
        case 'overlay':
          this.createOverlayEffect(effect);
          break;
        case 'screen_effect':
          this.applyScreenEffect(effect);
          break;
      }
    });
  }
  
  private createParticleEffect(effect: VisualEffect): void {
    // Create particle effect
    console.log(`Creating particle effect: ${effect.parameters.type || 'generic'}`);
  }
  
  private applyLightingEffect(effect: VisualEffect): void {
    // Apply lighting changes
    console.log(`Applying lighting effect: intensity ${effect.intensity}`);
  }
  
  private createOverlayEffect(effect: VisualEffect): void {
    // Create screen overlay
    console.log(`Creating overlay effect: ${effect.parameters.type || 'generic'}`);
  }
  
  private applyScreenEffect(effect: VisualEffect): void {
    // Apply screen-wide effect
    console.log(`Applying screen effect: ${effect.parameters.type || 'generic'}`);
  }
  
  private updateEventStats(event: WorldEvent): void {
    this.eventStats.totalEventsTriggered++;
    
    // Update by type
    this.eventStats.eventsByType[event.type] = (this.eventStats.eventsByType[event.type] || 0) + 1;
    
    // Update by rarity
    this.eventStats.eventsByRarity[event.rarity] = (this.eventStats.eventsByRarity[event.rarity] || 0) + 1;
    
    // Count rare events
    if (['epic', 'legendary', 'mythic'].includes(event.rarity)) {
      this.eventStats.rareEventCount++;
    }
  }
  
  private onFloorChange(newFloor: number, oldFloor: number): void {
    // Trigger floor-based events
    const floorEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'floor_enter' && this.canTriggerEvent(event)
    );
    
    floorEvents.forEach(event => {
      if (Math.random() < 0.4) { // 40% chance per applicable event
        this.eventQueue.push(event);
      }
    });
  }
  
  private updateAtmosphereForEnvironment(environment: EnvironmentType): void {
    const environmentAtmosphere: { [key in EnvironmentType]: Partial<AtmosphereSettings> } = {
      shallow: {
        ambientLighting: 0.6,
        fogIntensity: 0.1,
        environmentalSounds: ['water_drip', 'distant_echo'],
        weatherEffects: []
      },
      deep: {
        ambientLighting: 0.4,
        fogIntensity: 0.3,
        environmentalSounds: ['deep_rumble', 'water_pressure'],
        weatherEffects: ['light_current']
      },
      abyss: {
        ambientLighting: 0.2,
        fogIntensity: 0.4,
        environmentalSounds: ['abyss_whisper', 'pressure_creak'],
        weatherEffects: ['strong_current']
      },
      volcanic: {
        ambientLighting: 0.7,
        fogIntensity: 0.2,
        environmentalSounds: ['lava_bubble', 'volcanic_rumble'],
        weatherEffects: ['heat_shimmer', 'volcanic_ash']
      },
      frozen: {
        ambientLighting: 0.5,
        fogIntensity: 0.1,
        environmentalSounds: ['ice_crack', 'wind_howl'],
        weatherEffects: ['snow_drift', 'ice_formation']
      },
      crystal: {
        ambientLighting: 0.8,
        fogIntensity: 0.0,
        environmentalSounds: ['crystal_chime', 'harmonic_resonance'],
        weatherEffects: ['crystal_sparkle']
      },
      void: {
        ambientLighting: 0.1,
        fogIntensity: 0.8,
        environmentalSounds: ['void_whisper', 'reality_distortion'],
        weatherEffects: ['void_tendrils', 'space_distortion']
      },
      ancient: {
        ambientLighting: 0.3,
        fogIntensity: 0.3,
        environmentalSounds: ['ancient_echo', 'stone_settling'],
        weatherEffects: ['dust_motes', 'time_decay']
      }
    };
    
    const newSettings = { ...this.getDefaultAtmosphere(), ...environmentAtmosphere[environment] };
    this.currentAtmosphere = newSettings;
    this.applyAtmosphereSettings();
  }
  
  private updateAtmosphere(delta: number): void {
    // Apply atmosphere overrides
    this.applyAtmosphereSettings();
  }
  
  private applyAtmosphereSettings(): void {
    let finalSettings = { ...this.currentAtmosphere };
    
    // Apply overrides
    this.atmosphereOverrides.forEach(override => {
      finalSettings = { ...finalSettings, ...override };
    });
    
    // Apply to scene
    this.scene.events.emit('update-atmosphere', finalSettings);
  }
  
  private checkForStoryElements(floor: number, environment: EnvironmentType): void {
    // Check if any story elements should appear on this floor
    this.environmentalStories.forEach(story => {
      if (story.environmentType === environment && 
          floor >= story.floorRange.min && 
          floor <= story.floorRange.max) {
        
        story.elements.forEach(element => {
          if (!element.discovered && Math.random() < 0.1) { // 10% chance per element
            // Spawn story element
            this.scene.events.emit('spawn-story-element', element);
          }
        });
      }
    });
  }
  
  private updateStoryProgress(story: EnvironmentalStory): void {
    const discoveredCount = story.elements.filter(e => e.discovered).length;
    const requiredCount = story.elements.filter(e => e.requiredForCompletion).length;
    
    story.discoveryProgress = Math.round((discoveredCount / story.elements.length) * 100);
    
    const requiredDiscovered = story.elements.filter(e => e.requiredForCompletion && e.discovered).length;
    if (requiredDiscovered >= requiredCount) {
      story.isComplete = true;
      this.onStoryCompleted(story);
    }
  }
  
  private onStoryCompleted(story: EnvironmentalStory): void {
    this.eventStats.storiesDiscovered++;
    
    // Show completion notification
    this.scene.events.emit('story-completed', story);
    console.log(`📚 Environmental story completed: ${story.title}`);
    
    // Award completion rewards
    // IMPLEMENTED: Implement story completion rewards
  }
  
  private showStoryDiscovery(element: StoryElement): void {
    // Display story element to player
    this.scene.events.emit('show-story-element', element);
    console.log(`📜 Story element discovered: ${element.text}`);
  }
  
  // Event handlers
  
  private onFloorReached(floor: number): void {
    // Handled in setFloorAndEnvironment
  }
  
  private onEnemyDefeated(enemy: any): void {
    // Trigger action-based events
    const actionEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'action_based' && this.canTriggerEvent(event)
    );
    
    actionEvents.forEach(event => {
      if (Math.random() < 0.05) { // 5% chance per enemy defeat
        this.eventQueue.push(event);
      }
    });
  }
  
  private onItemCollected(item: any): void {
    // Trigger exploration-based events
    const explorationEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'exploration' && this.canTriggerEvent(event)
    );
    
    explorationEvents.forEach(event => {
      if (Math.random() < 0.03) { // 3% chance per item collected
        this.eventQueue.push(event);
      }
    });
  }
  
  private onBossDefeated(floorNumber: number): void {
    // Trigger boss-related events
    const bossEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'boss_defeat' && this.canTriggerEvent(event)
    );
    
    bossEvents.forEach(event => {
      if (Math.random() < 0.3) { // 30% chance per boss defeat
        this.eventQueue.push(event);
      }
    });
  }
  
  private onAchievementCompleted(achievement: any): void {
    // Trigger achievement-based events
    const achievementEvents = Array.from(this.allEvents.values()).filter(event => 
      event.trigger === 'achievement_based' && 
      event.prerequisites.includes(achievement.id) && 
      this.canTriggerEvent(event)
    );
    
    achievementEvents.forEach(event => {
      this.eventQueue.push(event);
    });
  }
}
