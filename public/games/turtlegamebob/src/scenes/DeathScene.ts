/**
 * DeathScene - Game over and meta-progression
 * Handles permadeath and unlocks for the legendary roguelike
 */

import Phaser from 'phaser';

export class DeathScene extends Phaser.Scene {
  private stats: any;
  private rexUI: any;
  
  constructor() {
    super({ key: 'DeathScene' });
  }
  
  init(data: any): void {
    this.stats = data || { floorNumber: 3, heroClass: 'Swift Current' };
    this.rexUI = (this.plugins.get('rexUI') as any);
  }

  create(): void {
    console.log('💀 Hero has fallen - showing death screen');
    
    this.createBackground();
    this.createDeathUI();
    this.setupControls();
    this.playDeathMusic();
  }

  private createBackground(): void {
    // Dark red overlay for death
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x2c1810, 0x2c1810, 0x8b0000, 0x8b0000);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // Add floating spirits effect
    for (let i = 0; i < 15; i++) {
      const spirit = this.add.circle(
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(this.cameras.main.height, this.cameras.main.height + 200),
        Phaser.Math.Between(3, 12),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );
      
      this.tweens.add({
        targets: spirit,
        y: -50,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Sine.easeOut',
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      });
    }
  }

  private createDeathUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Death title
    this.add.text(centerX, centerY - 200, '💀 HERO FALLEN', {
      fontSize: '56px',
      color: '#ff4444',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.add.text(centerX, centerY - 150, `${this.stats.heroClass} Bob has perished in the depths...`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Calculate run statistics
    const floorsExplored = this.stats.floorNumber || 3;
    const enemiesDefeated = Math.floor(floorsExplored * (10 + Math.random() * 10));
    const treasureCollected = Math.floor(floorsExplored * (3 + Math.random() * 5));
    const timeMinutes = Math.floor(floorsExplored * (2 + Math.random() * 3));
    const timeSeconds = Math.floor(Math.random() * 60);
    const timeFormatted = `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`;
    const xpGained = floorsExplored * 250 + enemiesDefeated * 10;
    
    // Run statistics
    if (this.rexUI) {
      // Create Rex UI panel for stats
      this.createRexUIStats(centerX, centerY - 60, {
        floorsExplored,
        enemiesDefeated,
        treasureCollected,
        timeFormatted,
        xpGained
      });
    } else {
      // Fallback to basic stats display
      this.createBasicStats(centerX, centerY - 60, {
        floorsExplored,
        enemiesDefeated,
        treasureCollected,
        timeFormatted,
        xpGained
      });
    }
    
    // Meta-progression unlocks
    this.add.text(centerX, centerY + 80, 'UNLOCKS & REWARDS', {
      fontSize: '24px',
      color: '#ffd700',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Calculate unlocks based on floor reached
    const achievements = [];
    if (floorsExplored >= 1) achievements.push('🏆 Achievement: Dungeon Diver');
    if (floorsExplored >= 5) achievements.push('🏆 Achievement: Deep Explorer');
    if (floorsExplored >= 10) achievements.push('🏆 Achievement: Abyss Delver');
    if (enemiesDefeated >= 50) achievements.push('🏆 Achievement: Shell Slayer');
    
    const talentPoints = Math.floor(floorsExplored / 5) + 1;
    const unlocks = [`⭐ Talent Points Gained: +${talentPoints}`];
    
    if (floorsExplored >= 5) unlocks.push('🔓 New Item Unlocked: Turtle Shell Shield');
    if (floorsExplored >= 10) unlocks.push('🔓 New Shell Class Ability Unlocked');
    
    // Display achievements and unlocks
    let yPos = centerY + 110;
    achievements.forEach(achievement => {
      this.add.text(centerX, yPos, achievement, {
        fontSize: '16px',
        color: '#ffd700',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      yPos += 20;
    });
    
    unlocks.forEach(unlock => {
      this.add.text(centerX, yPos, unlock, {
        fontSize: '16px',
        color: '#88ff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      yPos += 20;
    });
    
    // Create action buttons
    if (this.rexUI) {
      this.createRexUIButtons(centerX, centerY + 200);
    } else {
      this.createBasicButtons(centerX, centerY + 200);
    }
    
    // Controls hint
    this.add.text(centerX, this.cameras.main.height - 40, 
      'SPACE: New Game+ • ESC: Main Menu', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  
  private createRexUIStats(x: number, y: number, stats: any): void {
    // Title
    this.add.text(x, y - 30, 'RUN STATISTICS', {
      fontSize: '28px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Format stats for display
    const statLines = [
      `Floors Explored: ${stats.floorsExplored}`,
      `Enemies Defeated: ${stats.enemiesDefeated}`,
      `Treasure Collected: ${stats.treasureCollected}`,
      `Time Survived: ${stats.timeFormatted}`,
      `Experience Gained: ${stats.xpGained.toLocaleString()} XP`
    ];
    
    // Create stats panel
    const panel = this.rexUI.add.gridSizer({
      x: x,
      y: y + 50,
      width: 400,
      height: 150,
      column: 1,
      row: statLines.length,
      rowProportions: 1,
      space: { row: 10 }
    });
    
    // Add stats to panel
    statLines.forEach((line, index) => {
      panel.add(
        this.add.text(0, 0, line, {
          fontSize: '18px',
          color: '#cccccc',
          fontFamily: 'Arial'
        }),
        0, // column
        index, // row
        'center', // align
        0, // padding
        true // expand
      );
    });
    
    panel.layout();
  }
  
  private createBasicStats(x: number, y: number, stats: any): void {
    // Title
    this.add.text(x, y - 30, 'RUN STATISTICS', {
      fontSize: '28px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Format stats for display
    const statLines = [
      `Floors Explored: ${stats.floorsExplored}`,
      `Enemies Defeated: ${stats.enemiesDefeated}`,
      `Treasure Collected: ${stats.treasureCollected}`,
      `Time Survived: ${stats.timeFormatted}`,
      `Experience Gained: ${stats.xpGained.toLocaleString()} XP`
    ];
    
    // Display stats
    statLines.forEach((stat, index) => {
      this.add.text(x, y + (index * 25), stat, {
        fontSize: '18px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
  }
  
  private createRexUIButtons(x: number, y: number): void {
    // Create buttons container
    const buttons = this.rexUI.add.buttons({
      x: x,
      y: y,
      orientation: 'x',
      
      buttons: [
        this.createRexButton('NEW GAME+', '#00ff88', () => this.startNewGame()),
        this.createRexButton('MAIN MENU', '#ffffff', () => this.returnToMenu())
      ],
      
      space: { item: 40 },
      expand: false
    })
    .layout();
  }
  
  private createRexButton(text: string, color: string, callback: Function): any {
    return this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x000000, 0.5),
      text: this.add.text(0, 0, text, {
        fontSize: '24px',
        color: color,
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 2
      }),
      space: {
        left: 15,
        right: 15,
        top: 10,
        bottom: 10
      }
    })
    .setInteractive()
    .on('pointerover', function() {
      this.getElement('background').setFillStyle(0x333333, 0.8);
      this.getElement('text').setScale(1.1);
    })
    .on('pointerout', function() {
      this.getElement('background').setFillStyle(0x000000, 0.5);
      this.getElement('text').setScale(1.0);
    })
    .on('pointerdown', () => callback());
  }
  
  private createBasicButtons(x: number, y: number): void {
    // Action buttons
    const newGameButton = this.add.text(x - 120, y, 'NEW GAME+', {
      fontSize: '24px',
      color: '#00ff88',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    const menuButton = this.add.text(x + 120, y, 'MAIN MENU', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Make buttons interactive
    newGameButton.setInteractive({ useHandCursor: true });
    newGameButton.on('pointerover', () => {
      newGameButton.setScale(1.1);
      newGameButton.setColor('#88ff88');
    });
    newGameButton.on('pointerout', () => {
      newGameButton.setScale(1.0);
      newGameButton.setColor('#00ff88');
    });
    newGameButton.on('pointerdown', () => this.startNewGame());
    
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
      menuButton.setColor('#cccccc');
    });
    menuButton.on('pointerout', () => {
      menuButton.setScale(1.0);
      menuButton.setColor('#ffffff');
    });
    menuButton.on('pointerdown', () => this.returnToMenu());
  }

  private setupControls(): void {
    this.input.keyboard?.on('keydown-SPACE', () => this.startNewGame());
    this.input.keyboard?.on('keydown-ESC', () => this.returnToMenu());
  }

  private startNewGame(): void {
    console.log('🔄 Starting New Game+ with meta-progression');
    
    // Save meta-progression data
    this.saveMetaProgression();
    
    // Apply meta-progression bonuses
    this.applyMetaProgression();
    
    this.cameras.main.fade(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameSceneECS');
    });
  }

  private returnToMenu(): void {
    console.log('📋 Returning to main menu');
    
    // Save meta-progression data
    this.saveMetaProgression();
    
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
  
  private saveMetaProgression(): void {
    // Calculate meta progression values
    const floorReached = this.stats.floorNumber || 1;
    const currentHighest = parseInt(localStorage.getItem('highestFloor') || '0');
    
    // Save highest floor
    if (floorReached > currentHighest) {
      localStorage.setItem('highestFloor', floorReached.toString());
    }
    
    // Save death count
    const deathCount = parseInt(localStorage.getItem('deathCount') || '0') + 1;
    localStorage.setItem('deathCount', deathCount.toString());
    
    // Save meta XP
    const xpGained = floorReached * 100;
    const currentXP = parseInt(localStorage.getItem('metaXP') || '0');
    localStorage.setItem('metaXP', (currentXP + xpGained).toString());
    
    // Save talent points
    const talentPointsGained = Math.floor(floorReached / 5) + 1;
    const currentPoints = parseInt(localStorage.getItem('talentPoints') || '0');
    localStorage.setItem('talentPoints', (currentPoints + talentPointsGained).toString());
    
    console.log(`💾 Meta-progression saved: Floor ${floorReached}, XP +${xpGained}, TP +${talentPointsGained}, Death #${deathCount}`);
  }
  
  private applyMetaProgression(): void {
    // Apply meta-progression bonuses to registry for next game
    const talentPoints = parseInt(localStorage.getItem('talentPoints') || '0');
    const metaXP = parseInt(localStorage.getItem('metaXP') || '0');
    const deathCount = parseInt(localStorage.getItem('deathCount') || '0');
    const highestFloor = parseInt(localStorage.getItem('highestFloor') || '0');
    
    // Store meta-progression in registry for next game
    this.registry.set('talentPoints', talentPoints);
    this.registry.set('metaXP', metaXP);
    this.registry.set('deathCount', deathCount);
    this.registry.set('highestFloor', highestFloor);
    
    // Calculate bonuses based on progression
    const healthBonus = Math.floor(metaXP / 1000) * 5; // +5 HP per 1000 XP
    const damageBonus = Math.floor(metaXP / 2000); // +1 damage per 2000 XP
    const luckBonus = Math.floor(deathCount / 5); // +1 luck per 5 deaths
    
    // Store bonuses in registry
    this.registry.set('healthBonus', healthBonus);
    this.registry.set('damageBonus', damageBonus);
    this.registry.set('luckBonus', luckBonus);
    
    console.log(`🌟 Meta-progression applied: HP +${healthBonus}, DMG +${damageBonus}, LUCK +${luckBonus}`);
  }

  private playDeathMusic(): void {
    // Stop current music
    const currentMusic = this.registry.get('currentMusic');
    if (currentMusic) {
      currentMusic.stop();
    }
    
    if (this.registry.get('musicEnabled')) {
      // Play somber death music (track 3)
      const music = this.sound.add('music3', {
        volume: this.registry.get('musicVolume') * 0.8, // Quieter for atmosphere
        loop: false
      });
      music.play();
      this.registry.set('currentMusic', music);
      console.log('🎵 Death music started');
    }
  }
}
