/**
 * Simple Boss System - Victory Conditions for Clean Game
 */

import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';

interface BossData {
  id: string;
  name: string;
  floor: number;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  defeated: boolean;
  rewards: { experience: number; gold: number; };
}

export class SimpleBossSystem {
  private scene: Phaser.Scene;
  private bosses: Map<number, BossData> = new Map();
  private gameCompleted: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeBosses();
    console.log('👑 Simple Boss System initialized');
  }
  
  private initializeBosses(): void {
    // Floor 5 Boss
    this.bosses.set(5, {
      id: 'shell_crusher', name: 'Shell Crusher', floor: 5,
      maxHP: 200, currentHP: 200, attack: 25, defense: 15, defeated: false,
      rewards: { experience: 500, gold: 200 }
    });
    
    // Floor 10 Boss  
    this.bosses.set(10, {
      id: 'fire_belly_ancient', name: 'Fire Belly Ancient', floor: 10,
      maxHP: 350, currentHP: 350, attack: 35, defense: 25, defeated: false,
      rewards: { experience: 1000, gold: 500 }
    });
    
    // Final Boss
    this.bosses.set(15, {
      id: 'void_leviathan', name: 'The Void Leviathan', floor: 15,
      maxHP: 500, currentHP: 500, attack: 50, defense: 35, defeated: false,
      rewards: { experience: 2000, gold: 1000 }
    });
  }
  
  public hasBossOnFloor(floor: number): boolean {
    return this.bosses.has(floor) && !this.bosses.get(floor)!.defeated;
  }
  
  public getBossForFloor(floor: number): BossData | null {
    const boss = this.bosses.get(floor);
    return boss && !boss.defeated ? boss : null;
  }
  
  public defeatBoss(floor: number): void {
    const boss = this.bosses.get(floor);
    if (!boss) return;
    
    boss.defeated = true;
    
    const { addExperience, updateHeroStats } = useGameStore.getState();
    const currentHero = useGameStore.getState().hero;
    
    addExperience(boss.rewards.experience);
    updateHeroStats({ 
      gold: currentHero.gold + boss.rewards.gold,
      bossesDefeated: currentHero.bossesDefeated + 1
    });
    
    console.log(`🏆 Boss defeated: ${boss.name}!`);
    
    // Check victory
    if (Array.from(this.bosses.values()).every(b => b.defeated) && !this.gameCompleted) {
      this.triggerVictory();
    }
  }
  
  private triggerVictory(): void {
    this.gameCompleted = true;
    console.log('🎉 GAME COMPLETED! Victory achieved!');
    
    const { width, height } = this.scene.cameras.main;
    this.scene.add.text(width / 2, height / 2, 
      '🎉 VICTORY! 🎉\nYou conquered the dungeon!', 
      { fontSize: '24px', color: '#ffff44', fontStyle: 'bold', align: 'center' }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
  }
  
  public isGameCompleted(): boolean {
    return this.gameCompleted;
  }
}

console.log('👑 Simple Boss System ready');
