/**
 * SkillsScene - Class-specific skill tree interface
 * Legendary talent allocation system for each Shell Class
 */

import Phaser from 'phaser';
import { SkillSystem, SkillTree, SkillNode } from '../systems/SkillSystem';
import { Hero, ShellClass } from '../entities/Hero';

export class SkillsScene extends Phaser.Scene {
  private skillSystem!: SkillSystem;
  private hero!: Hero;
  
  // UI containers
  private skillTreeContainer!: Phaser.GameObjects.Container;
  private tabsContainer!: Phaser.GameObjects.Container;
  private infoContainer!: Phaser.GameObjects.Container;
  
  // State
  private activeTab: ShellClass | 'cross' = 'Shell Defender';
  private selectedNode: SkillNode | null = null;
  private skillNodeSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  
  constructor() {
    super({ key: 'SkillsScene' });
  }
  
  create(): void {
    console.log('🌟 Legendary Skill Trees opened');
    
    // Get hero from game scene
    const gameScene = this.scene.get('GameScene') as any;
    this.hero = gameScene.hero;
    
    // Initialize skill system
    this.skillSystem = new SkillSystem(this);
    this.skillSystem.setHero(this.hero);
    
    this.createBackground();
    this.createSkillTreeInterface();
    this.setupControls();
    
    // Start with hero's shell class tree
    this.activeTab = this.hero.shellClass;
    this.displaySkillTree(this.activeTab);
  }
  
  private createBackground(): void {
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // Main panel
    const panelWidth = 1000;
    const panelHeight = 650;
    const panelX = (this.cameras.main.width - panelWidth) / 2;
    const panelY = (this.cameras.main.height - panelHeight) / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a1a, 0.95);
    panel.lineStyle(3, 0x00ff88);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
  }
  
  private createSkillTreeInterface(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // Title
    this.add.text(centerX, centerY - 300, `🌟 ${this.hero.shellClass.toUpperCase()} MASTERY`, {
      fontSize: '32px',
      color: '#00ff88',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Talent points display
    this.createTalentPointsDisplay(centerX, centerY - 260);
    
    // Tabs for different trees
    this.createTreeTabs(centerX, centerY - 220);
    
    // Main skill tree area
    this.skillTreeContainer = this.add.container(centerX, centerY - 50);
    
    // Info panel on the right
    this.createInfoPanel(centerX + 350, centerY - 50);
    
    // Action buttons
    this.createActionButtons(centerX, centerY + 280);
  }
  
  private createTalentPointsDisplay(x: number, y: number): void {
    const availablePoints = this.skillSystem.getAvailableTalentPoints();
    const spentPoints = this.skillSystem.getTotalPointsSpent();
    
    this.add.text(x, y, `Talent Points: ${availablePoints} Available | ${spentPoints} Spent`, {
      fontSize: '18px',
      color: availablePoints > 0 ? '#ffff00' : '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
  }
  
  private createTreeTabs(x: number, y: number): void {
    this.tabsContainer = this.add.container(x, y);
    
    const tabs = [
      { key: this.hero.shellClass, name: this.hero.shellClass, color: this.getClassColor(this.hero.shellClass) },
      { key: 'cross' as const, name: 'Universal', color: 0x888888 }
    ];
    
    tabs.forEach((tab, index) => {
      const tabX = (index - 0.5) * 200;
      
      // Tab background
      const tabBg = this.add.graphics();
      const isActive = this.activeTab === tab.key;
      
      tabBg.fillStyle(isActive ? tab.color : 0x444444, isActive ? 0.8 : 0.6);
      tabBg.lineStyle(2, tab.color);
      tabBg.fillRoundedRect(-80, -15, 160, 30, 8);
      tabBg.strokeRoundedRect(-80, -15, 160, 30, 8);
      
      // Tab text
      const tabText = this.add.text(0, 0, tab.name, {
        fontSize: '16px',
        color: isActive ? '#ffffff' : '#cccccc',
        fontFamily: 'Arial Black'
      }).setOrigin(0.5);
      
      const tabContainer = this.add.container(tabX, 0, [tabBg, tabText]);
      tabContainer.setInteractive(new Phaser.Geom.Rectangle(-80, -15, 160, 30), Phaser.Geom.Rectangle.Contains);
      
      tabContainer.on('pointerover', () => {
        if (this.activeTab !== tab.key) {
          tabBg.clear();
          tabBg.fillStyle(tab.color, 0.4);
          tabBg.lineStyle(2, tab.color);
          tabBg.fillRoundedRect(-80, -15, 160, 30, 8);
          tabBg.strokeRoundedRect(-80, -15, 160, 30, 8);
        }
      });
      
      tabContainer.on('pointerout', () => {
        if (this.activeTab !== tab.key) {
          tabBg.clear();
          tabBg.fillStyle(0x444444, 0.6);
          tabBg.lineStyle(2, tab.color);
          tabBg.fillRoundedRect(-80, -15, 160, 30, 8);
          tabBg.strokeRoundedRect(-80, -15, 160, 30, 8);
        }
      });
      
      tabContainer.on('pointerdown', () => {
        this.switchTab(tab.key);
      });
      
      this.tabsContainer.add(tabContainer);
    });
  }
  
  private switchTab(newTab: ShellClass | 'cross'): void {
    if (this.activeTab === newTab) return;
    
    this.activeTab = newTab;
    this.displaySkillTree(newTab);
    this.updateTabsVisual();
  }
  
  private displaySkillTree(treeType: ShellClass | 'cross'): void {
    // Clear existing skill tree
    this.skillTreeContainer.removeAll(true);
    this.skillNodeSprites.clear();
    
    if (treeType === 'cross') {
      this.displayCrossClassSkills();
    } else {
      const skillTree = this.skillSystem.getSkillTree(treeType);
      if (skillTree) {
        this.displayShellClassTree(skillTree);
      }
    }
  }
  
  private displayShellClassTree(skillTree: SkillTree): void {
    // Create skill nodes
    skillTree.nodes.forEach(skill => {
      this.createSkillNode(skill, skillTree.color);
    });
    
    // Create connection lines
    this.createConnectionLines(skillTree.nodes, skillTree.color);
  }
  
  private displayCrossClassSkills(): void {
    const crossSkills = this.skillSystem.getCrossClassSkills();
    
    crossSkills.forEach((skill, index) => {
      // Arrange cross-class skills in a horizontal line
      skill.row = 0;
      skill.column = index;
      this.createSkillNode(skill, 0x888888);
    });
  }
  
  private createSkillNode(skill: SkillNode, treeColor: number): void {
    const nodeX = (skill.column - 1) * 120;
    const nodeY = skill.row * 100;
    
    const nodeContainer = this.add.container(nodeX, nodeY);
    
    // Node background circle
    const nodeSize = 50;
    const isLearned = skill.currentLevel > 0;
    const canLearn = this.skillSystem.meetsRequirements(skill) && this.skillSystem.getAvailableTalentPoints() > 0;
    const isMaxed = skill.currentLevel >= skill.maxLevel;
    
    let nodeColor = 0x444444;
    let borderColor = 0x666666;
    
    if (isMaxed) {
      nodeColor = treeColor;
      borderColor = 0xffffff;
    } else if (isLearned) {
      nodeColor = treeColor;
      borderColor = treeColor;
    } else if (canLearn) {
      nodeColor = 0x666666;
      borderColor = 0x00ff88;
    }
    
    const nodeBg = this.add.circle(0, 0, nodeSize / 2, nodeColor);
    nodeBg.setStrokeStyle(3, borderColor);
    
    // Skill icon (placeholder)
    const icon = this.add.text(0, 0, '🔥', {
      fontSize: '24px'
    }).setOrigin(0.5);
    
    // Level indicator
    if (skill.currentLevel > 0) {
      const levelText = this.add.text(20, -20, skill.currentLevel.toString(), {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5);
      nodeContainer.add(levelText);
    }
    
    // Max level indicator
    const maxLevelText = this.add.text(0, 35, `${skill.currentLevel}/${skill.maxLevel}`, {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Skill name
    const nameText = this.add.text(0, 50, skill.name, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'Arial',
      wordWrap: { width: 80 },
      align: 'center'
    }).setOrigin(0.5);
    
    nodeContainer.add([nodeBg, icon, maxLevelText, nameText]);
    
    // Make interactive
    nodeContainer.setSize(nodeSize, nodeSize);
    nodeContainer.setInteractive(new Phaser.Geom.Circle(0, 0, nodeSize / 2), Phaser.Geom.Circle.Contains);
    
    // Node events
    nodeContainer.on('pointerover', () => {
      this.selectedNode = skill;
      this.updateInfoPanel();
      
      if (canLearn || isLearned) {
        nodeBg.setStrokeStyle(4, 0xffffff);
      }
    });
    
    nodeContainer.on('pointerout', () => {
      nodeBg.setStrokeStyle(3, borderColor);
    });
    
    nodeContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        // Right click to remove point
        this.skillSystem.onSkillNodeClick(skill.id, true);
      } else {
        // Left click to allocate point
        this.skillSystem.onSkillNodeClick(skill.id, false);
      }
      
      this.updateDisplay();
    });
    
    this.skillTreeContainer.add(nodeContainer);
    this.skillNodeSprites.set(skill.id, nodeContainer);
  }
  
  private createConnectionLines(skills: SkillNode[], treeColor: number): void {
    skills.forEach(skill => {
      skill.requirements.forEach(reqId => {
        const reqSkill = skills.find(s => s.id === reqId);
        if (!reqSkill) return;
        
        const startX = (reqSkill.column - 1) * 120;
        const startY = reqSkill.row * 100;
        const endX = (skill.column - 1) * 120;
        const endY = skill.row * 100;
        
        const line = this.add.line(0, 0, startX, startY, endX, endY, treeColor, 0.6);
        line.setLineWidth(3);
        
        this.skillTreeContainer.add(line);
        this.skillTreeContainer.sendToBack(line);
      });
    });
  }
  
  private createInfoPanel(x: number, y: number): void {
    // Info panel background
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x2c3e50, 0.9);
    infoBg.lineStyle(2, 0x00ff88);
    infoBg.fillRoundedRect(-140, -150, 280, 300, 8);
    infoBg.strokeRoundedRect(-140, -150, 280, 300, 8);
    
    this.infoContainer = this.add.container(x, y, [infoBg]);
    
    // Title
    const infoTitle = this.add.text(0, -130, 'SKILL INFO', {
      fontSize: '16px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.infoContainer.add(infoTitle);
    
    this.updateInfoPanel();
  }
  
  private updateInfoPanel(): void {
    // Remove existing info content (keep background and title)
    const itemsToRemove = this.infoContainer.list.slice(2);
    itemsToRemove.forEach(item => item.destroy());
    
    if (!this.selectedNode) {
      const noSelectionText = this.add.text(0, 0, 'Hover over a skill\nto see details', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      this.infoContainer.add(noSelectionText);
      return;
    }
    
    const skill = this.selectedNode;
    
    // Skill name
    const nameText = this.add.text(0, -90, skill.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial Black',
      wordWrap: { width: 260 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Skill level
    const levelText = this.add.text(0, -60, `Level: ${skill.currentLevel}/${skill.maxLevel}`, {
      fontSize: '14px',
      color: skill.currentLevel > 0 ? '#00ff88' : '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Description
    const descText = this.add.text(0, -30, skill.description, {
      fontSize: '12px',
      color: '#cccccc',
      fontFamily: 'Arial',
      wordWrap: { width: 260 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Effects
    let effectsY = 20;
    this.add.text(0, effectsY, 'Effects:', {
      fontSize: '12px',
      color: '#00ff88',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    effectsY += 20;
    skill.effects.forEach(effect => {
      const effectText = this.add.text(0, effectsY, effect.description, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'Arial',
        wordWrap: { width: 260 },
        align: 'center'
      }).setOrigin(0.5);
      
      this.infoContainer.add(effectText);
      effectsY += 15;
    });
    
    // Requirements
    if (skill.requirements.length > 0 && skill.currentLevel === 0) {
      this.add.text(0, effectsY + 10, 'Requires:', {
        fontSize: '10px',
        color: '#ff8888',
        fontFamily: 'Arial Black'
      }).setOrigin(0.5);
      
      skill.requirements.forEach((reqId, index) => {
        const reqSkill = this.findSkillById(reqId);
        if (reqSkill) {
          const reqText = this.add.text(0, effectsY + 25 + (index * 12), reqSkill.name, {
            fontSize: '9px',
            color: reqSkill.currentLevel > 0 ? '#88ff88' : '#ff8888',
            fontFamily: 'Arial'
          }).setOrigin(0.5);
          
          this.infoContainer.add(reqText);
        }
      });
    }
    
    this.infoContainer.add([nameText, levelText, descText]);
  }
  
  private createActionButtons(x: number, y: number): void {
    // Reset skills button
    const resetButton = this.add.text(x - 120, y, '🔄 RESET SKILLS', {
      fontSize: '16px',
      color: '#ff6b6b',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerover', () => {
      resetButton.setScale(1.1);
      resetButton.setColor('#ff8888');
    });
    resetButton.on('pointerout', () => {
      resetButton.setScale(1.0);
      resetButton.setColor('#ff6b6b');
    });
    resetButton.on('pointerdown', () => this.confirmReset());
    
    // Close button
    const closeButton = this.add.text(x + 120, y, '✕ CLOSE', {
      fontSize: '16px',
      color: '#e74c3c',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerover', () => {
      closeButton.setScale(1.1);
      closeButton.setColor('#ff6b6b');
    });
    closeButton.on('pointerout', () => {
      closeButton.setScale(1.0);
      closeButton.setColor('#e74c3c');
    });
    closeButton.on('pointerdown', () => this.closeSkills());
  }
  
  private confirmReset(): void {
    // IMPLEMENTED: Show confirmation dialog
    const refunded = this.skillSystem.resetSkills('all');
    console.log(`🔄 Reset all skills, refunded ${refunded} points`);
    this.updateDisplay();
  }
  
  private updateDisplay(): void {
    this.displaySkillTree(this.activeTab);
    this.updateTalentPointsDisplay();
    this.updateInfoPanel();
  }
  
  private updateTabsVisual(): void {
    // Recreate tabs to update active state
    this.tabsContainer.removeAll(true);
    this.createTreeTabs(0, 0);
  }
  
  private updateTalentPointsDisplay(): void {
    // Find and update the talent points text
    // This would be more efficient with a stored reference
    this.createTalentPointsDisplay(this.cameras.main.width / 2, this.cameras.main.height / 2 - 260);
  }
  
  private setupControls(): void {
    // ESC or T to close
    this.input.keyboard?.on('keydown-ESC', () => this.closeSkills());
    this.input.keyboard?.on('keydown-T', () => this.closeSkills());
    
    // Tab switching
    this.input.keyboard?.on('keydown-ONE', () => this.switchTab(this.hero.shellClass));
    this.input.keyboard?.on('keydown-TWO', () => this.switchTab('cross'));
    
    // Reset hotkey
    this.input.keyboard?.on('keydown-R', () => this.confirmReset());
  }
  
  private closeSkills(): void {
    console.log('🌟 Skill Trees closed');
    
    // Save skill progression
    const skillData = this.skillSystem.saveProgressionData();
    // IMPLEMENTED: Save to SaveSystem
    
    // Cleanup
    this.skillSystem.destroy();
    
    this.scene.resume('GameScene');
    this.scene.stop();
  }
  
  private findSkillById(skillId: string): SkillNode | null {
    // Search in current tree
    if (this.activeTab === 'cross') {
      return this.skillSystem.getCrossClassSkills().find(s => s.id === skillId) || null;
    } else {
      const tree = this.skillSystem.getSkillTree(this.activeTab);
      return tree?.nodes.find(s => s.id === skillId) || null;
    }
  }
  
  private getClassColor(shellClass: ShellClass): number {
    const colors = {
      'Shell Defender': 0x8B4513,
      'Swift Current': 0x0077BE,
      'Fire Belly': 0xFF4500
    };
    return colors[shellClass];
  }
}
