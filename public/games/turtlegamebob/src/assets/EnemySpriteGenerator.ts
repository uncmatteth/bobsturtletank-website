/**
 * EnemySpriteGenerator - Creates professional-looking enemy sprites
 * Generates detailed enemy sprites for the game
 */

export class EnemySpriteGenerator {
  /**
   * Generate an enemy atlas texture with all animations
   */
  public static generateEnemyAtlas(width: number = 256, height: number = 256): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Create detailed pixel art for different enemy types
    const enemyTypes = [
      'slime', 'crab', 'fish', 'octopus',
      'jellyfish', 'shark', 'turtle', 'serpent'
    ];
    
    // Draw each enemy type
    enemyTypes.forEach((type, index) => {
      const x = (index % 4) * 64;
      const y = Math.floor(index / 4) * 64;
      
      this.drawEnemy(ctx, x, y, type);
    });
    
    return canvas.toDataURL();
  }
  
  /**
   * Draw an enemy based on its type
   */
  public static drawEnemy(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    enemyType: string
  ): void {
    const centerX = x + 32;
    const centerY = y + 32;
    
    switch (enemyType) {
      case 'slime':
        this.drawSlime(ctx, centerX, centerY);
        break;
      case 'crab':
        this.drawCrab(ctx, centerX, centerY);
        break;
      case 'fish':
        this.drawFish(ctx, centerX, centerY);
        break;
      case 'octopus':
        this.drawOctopus(ctx, centerX, centerY);
        break;
      case 'jellyfish':
        this.drawJellyfish(ctx, centerX, centerY);
        break;
      case 'shark':
        this.drawShark(ctx, centerX, centerY);
        break;
      case 'turtle':
        this.drawEvilTurtle(ctx, centerX, centerY);
        break;
      case 'serpent':
        this.drawSerpent(ctx, centerX, centerY);
        break;
      default:
        this.drawGenericEnemy(ctx, centerX, centerY);
        break;
    }
    
    // Add frame border for clarity
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeRect(x, y, 64, 64);
  }
  
  /**
   * Draw a slime enemy
   */
  private static drawSlime(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#00AA00',
      highlight: '#00FF00',
      shadow: '#008800',
      eye: '#FFFFFF',
      pupil: '#000000'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 20);
    ctx.fillRect(centerX - 16, centerY, 32, 12);
    ctx.fillRect(centerX - 14, centerY + 12, 28, 4);
    
    // Highlights
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(centerX - 10, centerY - 6, 6, 2);
    ctx.fillRect(centerX - 8, centerY - 4, 4, 2);
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 8, centerY - 2, 4, 4);
    ctx.fillRect(centerX + 4, centerY - 2, 4, 4);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 6, centerY, 2, 2);
    ctx.fillRect(centerX + 6, centerY, 2, 2);
    
    // Mouth
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(centerX - 4, centerY + 6, 8, 2);
  }
  
  /**
   * Draw a crab enemy
   */
  private static drawCrab(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#AA0000',
      highlight: '#FF0000',
      shadow: '#880000',
      eye: '#FFFFFF',
      pupil: '#000000',
      claw: '#CC0000'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 10, centerY - 6, 20, 12);
    
    // Legs
    ctx.fillRect(centerX - 14, centerY - 4, 4, 2);
    ctx.fillRect(centerX - 16, centerY - 2, 6, 2);
    ctx.fillRect(centerX - 14, centerY + 2, 4, 2);
    ctx.fillRect(centerX - 16, centerY + 4, 6, 2);
    
    ctx.fillRect(centerX + 10, centerY - 4, 4, 2);
    ctx.fillRect(centerX + 10, centerY - 2, 6, 2);
    ctx.fillRect(centerX + 10, centerY + 2, 4, 2);
    ctx.fillRect(centerX + 10, centerY + 4, 6, 2);
    
    // Claws
    ctx.fillStyle = colors.claw;
    ctx.fillRect(centerX - 18, centerY - 8, 8, 6);
    ctx.fillRect(centerX + 10, centerY - 8, 8, 6);
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 6, centerY - 8, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 8, 4, 4);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 4, centerY - 6, 2, 2);
    ctx.fillRect(centerX + 4, centerY - 6, 2, 2);
  }
  
  /**
   * Draw a fish enemy
   */
  private static drawFish(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#4444FF',
      highlight: '#8888FF',
      shadow: '#2222AA',
      eye: '#FFFFFF',
      pupil: '#000000',
      fin: '#6666FF'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 12, centerY - 6, 20, 12);
    ctx.fillRect(centerX - 8, centerY - 8, 12, 16);
    
    // Tail
    ctx.fillStyle = colors.fin;
    ctx.fillRect(centerX + 8, centerY - 8, 4, 16);
    ctx.fillRect(centerX + 12, centerY - 10, 4, 4);
    ctx.fillRect(centerX + 12, centerY + 6, 4, 4);
    
    // Fins
    ctx.fillRect(centerX - 4, centerY - 12, 8, 4);
    ctx.fillRect(centerX - 4, centerY + 8, 8, 4);
    
    // Eye
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 8, centerY - 4, 4, 4);
    
    // Pupil
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 6, centerY - 2, 2, 2);
  }
  
  /**
   * Draw an octopus enemy
   */
  private static drawOctopus(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#AA00AA',
      highlight: '#FF00FF',
      shadow: '#880088',
      eye: '#FFFFFF',
      pupil: '#000000',
      tentacle: '#CC00CC'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 10, centerY - 14, 20, 14);
    ctx.fillRect(centerX - 12, centerY - 12, 24, 10);
    
    // Tentacles
    ctx.fillStyle = colors.tentacle;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 10;
      const y = centerY + Math.sin(angle) * 10 + 4;
      
      ctx.fillRect(x - 2, y, 4, 12);
      ctx.fillRect(x - 4, y + 10, 8, 4);
    }
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 6, centerY - 10, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 10, 4, 4);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 4, centerY - 8, 2, 2);
    ctx.fillRect(centerX + 4, centerY - 8, 2, 2);
  }
  
  /**
   * Draw a jellyfish enemy
   */
  private static drawJellyfish(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#8800AA',
      highlight: '#AA00FF',
      shadow: '#660088',
      glow: 'rgba(170, 0, 255, 0.3)'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 10, centerY - 14, 20, 10);
    ctx.fillRect(centerX - 12, centerY - 12, 24, 6);
    
    // Tentacles
    for (let i = -3; i <= 3; i += 2) {
      const x = centerX + i * 3;
      ctx.fillRect(x - 1, centerY - 4, 2, 16);
      ctx.fillRect(x - 2, centerY + 10, 4, 4);
    }
    
    // Highlights
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(centerX - 8, centerY - 12, 16, 2);
    
    // Glow
    ctx.fillStyle = colors.glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 8, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw a shark enemy
   */
  private static drawShark(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#666666',
      highlight: '#888888',
      shadow: '#444444',
      eye: '#FFFFFF',
      pupil: '#000000',
      fin: '#555555',
      teeth: '#FFFFFF'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 16, centerY - 6, 32, 12);
    ctx.fillRect(centerX - 12, centerY - 8, 24, 16);
    
    // Head shape
    ctx.fillRect(centerX + 8, centerY - 4, 8, 8);
    
    // Tail
    ctx.fillStyle = colors.fin;
    ctx.fillRect(centerX - 16, centerY - 8, 4, 16);
    ctx.fillRect(centerX - 20, centerY - 10, 4, 4);
    ctx.fillRect(centerX - 20, centerY + 6, 4, 4);
    
    // Fins
    ctx.fillRect(centerX, centerY - 12, 8, 4);
    ctx.fillRect(centerX, centerY + 8, 8, 4);
    
    // Eye
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX + 10, centerY - 2, 4, 4);
    
    // Pupil
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX + 12, centerY, 2, 2);
    
    // Teeth
    ctx.fillStyle = colors.teeth;
    ctx.fillRect(centerX + 16, centerY - 2, 2, 2);
    ctx.fillRect(centerX + 16, centerY + 0, 2, 2);
    ctx.fillRect(centerX + 16, centerY + 2, 2, 2);
  }
  
  /**
   * Draw an evil turtle enemy
   */
  private static drawEvilTurtle(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      shell: '#880000',
      shellPattern: '#660000',
      body: '#AA0000',
      bodyLight: '#CC0000',
      bodyDark: '#880000',
      eye: '#FFFF00',
      pupil: '#FF0000'
    };
    
    // Shell
    ctx.fillStyle = colors.shell;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 16);
    ctx.fillRect(centerX - 10, centerY - 10, 20, 20);
    ctx.fillRect(centerX - 8, centerY - 12, 16, 24);
    
    // Shell pattern
    ctx.fillStyle = colors.shellPattern;
    ctx.fillRect(centerX - 6, centerY - 6, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 6, 4, 4);
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    ctx.fillRect(centerX - 6, centerY + 2, 4, 4);
    ctx.fillRect(centerX + 2, centerY + 2, 4, 4);
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 6, centerY + 8, 12, 8);
    ctx.fillRect(centerX - 14, centerY, 4, 8);
    ctx.fillRect(centerX + 10, centerY, 4, 8);
    
    // Head
    ctx.fillRect(centerX - 4, centerY - 16, 8, 8);
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 3, centerY - 14, 2, 2);
    ctx.fillRect(centerX + 1, centerY - 14, 2, 2);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 2, centerY - 13, 1, 1);
    ctx.fillRect(centerX + 2, centerY - 13, 1, 1);
  }
  
  /**
   * Draw a serpent enemy
   */
  private static drawSerpent(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#008800',
      highlight: '#00AA00',
      shadow: '#006600',
      eye: '#FFFF00',
      pupil: '#000000',
      tongue: '#FF0000'
    };
    
    // Body segments
    ctx.fillStyle = colors.body;
    
    // Head
    ctx.fillRect(centerX + 4, centerY - 6, 12, 12);
    
    // Body segments
    for (let i = 0; i < 4; i++) {
      const x = centerX - i * 8;
      const y = centerY + Math.sin(i * 0.8) * 6;
      ctx.fillRect(x - 4, y - 4, 8, 8);
    }
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX + 12, centerY - 4, 2, 2);
    ctx.fillRect(centerX + 12, centerY + 2, 2, 2);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX + 13, centerY - 3, 1, 1);
    ctx.fillRect(centerX + 13, centerY + 3, 1, 1);
    
    // Tongue
    ctx.fillStyle = colors.tongue;
    ctx.fillRect(centerX + 16, centerY, 4, 1);
    ctx.fillRect(centerX + 18, centerY - 1, 1, 3);
  }
  
  /**
   * Draw a generic enemy
   */
  private static drawGenericEnemy(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    // Colors
    const colors = {
      body: '#FF4444',
      highlight: '#FF8888',
      shadow: '#AA0000',
      eye: '#FFFFFF',
      pupil: '#000000'
    };
    
    // Body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 12, centerY - 12, 24, 24);
    ctx.fillRect(centerX - 16, centerY - 8, 32, 16);
    ctx.fillRect(centerX - 8, centerY - 16, 16, 32);
    
    // Eyes
    ctx.fillStyle = colors.eye;
    ctx.fillRect(centerX - 8, centerY - 6, 6, 6);
    ctx.fillRect(centerX + 2, centerY - 6, 6, 6);
    
    // Pupils
    ctx.fillStyle = colors.pupil;
    ctx.fillRect(centerX - 5, centerY - 3, 3, 3);
    ctx.fillRect(centerX + 5, centerY - 3, 3, 3);
    
    // Mouth
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(centerX - 6, centerY + 6, 12, 3);
  }
}





