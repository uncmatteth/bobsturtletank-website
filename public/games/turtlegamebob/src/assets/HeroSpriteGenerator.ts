/**
 * HeroSpriteGenerator - Creates professional-looking hero sprites
 * Generates detailed turtle hero sprites for all shell classes
 */

export class HeroSpriteGenerator {
  /**
   * Generate a hero atlas texture with all animations
   */
  public static generateHeroAtlas(width: number = 256, height: number = 320): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Create detailed pixel art for all shell classes
    const actions = ['idle', 'walk', 'attack', 'cast', 'death'];
    const directions = ['down', 'up', 'left', 'right'];
    const shellClasses = ['Shell Defender', 'Swift Current', 'Fire Belly'];
    
    // For now, just generate Swift Current (default class)
    const shellClass = 'Swift Current';
    const colors = this.getShellClassColors(shellClass);
    
    actions.forEach((action, actionIndex) => {
      directions.forEach((direction, dirIndex) => {
        const x = dirIndex * 64;
        const y = actionIndex * 64;
        
        // Create detailed turtle based on the reference style
        this.drawDetailedTurtle(ctx, x, y, direction, action, shellClass);
      });
    });
    
    return canvas.toDataURL();
  }
  
  /**
   * Get colors for a specific shell class
   */
  public static getShellClassColors(shellClass: string): any {
    switch (shellClass) {
      case 'Shell Defender':
        return {
          shell: '#8B4513', // Brown
          shellPattern: '#6B3E0B',
          body: '#A0522D',
          bodyLight: '#CD853F',
          bodyDark: '#8B4500',
          eyes: '#FFFFFF',
          eyesPupil: '#000000',
          classSymbol: '#8B4513', // Earth symbol color
          weapon: '#8B4513', // Shield color
          weaponMetal: '#D2B48C' // Shield border
        };
      case 'Fire Belly':
        return {
          shell: '#8B3E2F', // Red-brown
          shellPattern: '#6B2F23',
          body: '#CD5C5C',
          bodyLight: '#FF6347',
          bodyDark: '#8B2500',
          eyes: '#FFFF00',
          eyesPupil: '#FF4500',
          classSymbol: '#FF4500', // Fire symbol color
          weapon: '#FF4500', // Staff color
          weaponMetal: '#FFD700' // Staff ornaments
        };
      case 'Swift Current':
      default:
        return {
          shell: '#2F8B8B', // Teal
          shellPattern: '#236B6B',
          body: '#5F9EA0',
          bodyLight: '#ADD8E6',
          bodyDark: '#2F4F4F',
          eyes: '#FFFFFF',
          eyesPupil: '#000000',
          classSymbol: '#1E90FF', // Water symbol color
          weapon: '#1E90FF', // Sword color
          weaponMetal: '#ADD8E6' // Sword blade
        };
    }
  }
  
  /**
   * Draw a detailed turtle hero
   */
  public static drawDetailedTurtle(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    direction: string, 
    action: string,
    shellClass: string = 'Swift Current'
  ): void {
    // Get colors for the shell class
    const colors = this.getShellClassColors(shellClass);
    
    // Direction-specific adjustments
    let bodyOffsetX = 0;
    let bodyOffsetY = 0;
    let headOffsetX = 0;
    let headOffsetY = 0;
    
    switch (direction) {
      case 'up':
        headOffsetY = -4;
        break;
      case 'down':
        headOffsetY = 2;
        break;
      case 'left':
        headOffsetX = -2;
        break;
      case 'right':
        headOffsetX = 2;
        break;
    }
    
    // Action-specific modifications
    if (action === 'walk') {
      bodyOffsetY += Math.sin(Date.now() / 200) * 1; // Subtle bob
    } else if (action === 'attack') {
      if (direction === 'right') headOffsetX += 4;
      if (direction === 'left') headOffsetX -= 4;
    }
    
    const centerX = x + 32 + bodyOffsetX;
    const centerY = y + 32 + bodyOffsetY;
    
    // Draw shell (back layer)
    this.drawTurtleShell(ctx, centerX, centerY - 4, colors);
    
    // Draw body
    this.drawTurtleBody(ctx, centerX, centerY, direction, colors);
    
    // Draw head
    this.drawTurtleHead(ctx, centerX + headOffsetX, centerY + headOffsetY - 8, direction, colors);
    
    // Draw limbs
    this.drawTurtleLimbs(ctx, centerX, centerY, direction, action, colors);
    
    // Draw weapon for attack/cast actions
    if (action === 'attack' || action === 'cast') {
      this.drawWeapon(ctx, centerX, centerY, direction, action, shellClass, colors);
    }
    
    // Death effect
    if (action === 'death') {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(x, y, 64, 64);
    }
    
    // Magic effects for cast
    if (action === 'cast') {
      this.drawMagicEffects(ctx, centerX, centerY, shellClass, colors);
    }
  }
  
  /**
   * Draw turtle shell
   */
  private static drawTurtleShell(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    colors: any
  ): void {
    // Shell base (oval shape using rectangles for pixel art)
    ctx.fillStyle = colors.shell;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 16);
    ctx.fillRect(centerX - 10, centerY - 10, 20, 20);
    ctx.fillRect(centerX - 8, centerY - 12, 16, 24);
    
    // Shell pattern (hexagonal segments)
    ctx.fillStyle = colors.shellPattern;
    ctx.fillRect(centerX - 6, centerY - 6, 4, 4);
    ctx.fillRect(centerX + 2, centerY - 6, 4, 4);
    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
    ctx.fillRect(centerX - 6, centerY + 2, 4, 4);
    ctx.fillRect(centerX + 2, centerY + 2, 4, 4);
    
    // Shell edge highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 12, centerY - 8, 24, 2);
    ctx.fillRect(centerX - 10, centerY - 10, 2, 4);
    ctx.fillRect(centerX + 8, centerY - 10, 2, 4);
  }
  
  /**
   * Draw turtle body
   */
  private static drawTurtleBody(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    colors: any
  ): void {
    // Main body
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 8, centerY - 4, 16, 12);
    ctx.fillRect(centerX - 6, centerY - 6, 12, 16);
    
    // Body highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 6, centerY - 4, 2, 8);
    ctx.fillRect(centerX - 4, centerY - 6, 8, 2);
    
    // Body shadows
    ctx.fillStyle = colors.bodyDark;
    ctx.fillRect(centerX + 4, centerY + 4, 2, 6);
    ctx.fillRect(centerX - 2, centerY + 8, 6, 2);
    
    // Class symbol on chest
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 1, centerY + 1, 2, 4);
    ctx.fillRect(centerX - 2, centerY + 2, 4, 2);
    ctx.fillStyle = colors.classSymbol;
    ctx.fillRect(centerX, centerY + 2, 1, 2);
  }
  
  /**
   * Draw turtle head
   */
  private static drawTurtleHead(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    colors: any
  ): void {
    // Head base
    ctx.fillStyle = colors.body;
    ctx.fillRect(centerX - 4, centerY - 2, 8, 6);
    ctx.fillRect(centerX - 3, centerY - 4, 6, 8);
    
    // Head highlights
    ctx.fillStyle = colors.bodyLight;
    ctx.fillRect(centerX - 3, centerY - 3, 2, 4);
    
    // Eyes
    if (direction === 'up') {
      // Back of head when facing up
      ctx.fillStyle = colors.bodyDark;
      ctx.fillRect(centerX - 2, centerY, 4, 2);
    } else {
      // Eyes
      ctx.fillStyle = colors.eyes;
      
      if (direction === 'down') {
        ctx.fillRect(centerX - 2, centerY - 2, 2, 2);
        ctx.fillRect(centerX + 1, centerY - 2, 2, 2);
        
        // Pupils
        ctx.fillStyle = colors.eyesPupil;
        ctx.fillRect(centerX - 1, centerY - 2, 1, 1);
        ctx.fillRect(centerX + 2, centerY - 2, 1, 1);
      } else if (direction === 'left') {
        ctx.fillRect(centerX - 3, centerY - 2, 2, 2);
        
        // Pupil
        ctx.fillStyle = colors.eyesPupil;
        ctx.fillRect(centerX - 3, centerY - 2, 1, 1);
      } else if (direction === 'right') {
        ctx.fillRect(centerX + 1, centerY - 2, 2, 2);
        
        // Pupil
        ctx.fillStyle = colors.eyesPupil;
        ctx.fillRect(centerX + 2, centerY - 2, 1, 1);
      }
    }
  }
  
  /**
   * Draw turtle limbs
   */
  private static drawTurtleLimbs(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    action: string,
    colors: any
  ): void {
    // Limb color
    ctx.fillStyle = colors.body;
    
    // Legs
    const legOffset = action === 'walk' ? Math.sin(Date.now() / 150) * 2 : 0;
    
    // Front legs
    ctx.fillRect(centerX - 10, centerY + 4, 4, 6 + legOffset);
    ctx.fillRect(centerX + 6, centerY + 4, 4, 6 - legOffset);
    
    // Back legs
    ctx.fillRect(centerX - 10, centerY + 10, 4, 6 - legOffset);
    ctx.fillRect(centerX + 6, centerY + 10, 4, 6 + legOffset);
    
    // Arm for attack/cast
    if (action === 'attack' || action === 'cast') {
      if (direction === 'right') {
        ctx.fillRect(centerX + 8, centerY, 6, 4);
      } else if (direction === 'left') {
        ctx.fillRect(centerX - 14, centerY, 6, 4);
      } else if (direction === 'down') {
        ctx.fillRect(centerX + 4, centerY + 8, 4, 6);
      } else if (direction === 'up') {
        ctx.fillRect(centerX + 4, centerY - 10, 4, 6);
      }
    }
  }
  
  /**
   * Draw weapon
   */
  private static drawWeapon(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    action: string,
    shellClass: string,
    colors: any
  ): void {
    switch (shellClass) {
      case 'Shell Defender':
        this.drawShield(ctx, centerX, centerY, direction, colors);
        break;
      case 'Fire Belly':
        this.drawStaff(ctx, centerX, centerY, direction, action, colors);
        break;
      case 'Swift Current':
      default:
        this.drawSword(ctx, centerX, centerY, direction, action, colors);
        break;
    }
  }
  
  /**
   * Draw sword (Swift Current)
   */
  private static drawSword(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    action: string,
    colors: any
  ): void {
    // Sword position based on direction
    let swordX = centerX;
    let swordY = centerY;
    let swordRotation = 0;
    
    if (direction === 'right') {
      swordX = centerX + 14;
      swordY = centerY;
      swordRotation = 0;
    } else if (direction === 'left') {
      swordX = centerX - 14;
      swordY = centerY;
      swordRotation = Math.PI;
    } else if (direction === 'down') {
      swordX = centerX + 8;
      swordY = centerY + 14;
      swordRotation = Math.PI / 2;
    } else if (direction === 'up') {
      swordX = centerX + 8;
      swordY = centerY - 14;
      swordRotation = -Math.PI / 2;
    }
    
    // Save context for rotation
    ctx.save();
    ctx.translate(swordX, swordY);
    ctx.rotate(swordRotation);
    
    // Sword blade
    ctx.fillStyle = colors.weaponMetal;
    ctx.fillRect(-1, -12, 2, 16);
    ctx.fillRect(-2, -8, 4, 2);
    
    // Sword handle
    ctx.fillStyle = colors.weapon;
    ctx.fillRect(-2, 4, 4, 6);
    ctx.fillRect(-3, 6, 6, 2);
    
    // Sword glow for attack
    if (action === 'attack') {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = colors.classSymbol;
      ctx.fillRect(-3, -14, 6, 20);
      ctx.globalAlpha = 1.0;
    }
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Draw shield (Shell Defender)
   */
  private static drawShield(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    colors: any
  ): void {
    // Shield position based on direction
    let shieldX = centerX;
    let shieldY = centerY;
    
    if (direction === 'right') {
      shieldX = centerX + 14;
      shieldY = centerY;
    } else if (direction === 'left') {
      shieldX = centerX - 14;
      shieldY = centerY;
    } else if (direction === 'down') {
      shieldX = centerX + 8;
      shieldY = centerY + 14;
    } else if (direction === 'up') {
      shieldX = centerX + 8;
      shieldY = centerY - 14;
    }
    
    // Shield base
    ctx.fillStyle = colors.weapon;
    ctx.fillRect(shieldX - 6, shieldY - 8, 12, 16);
    
    // Shield border
    ctx.fillStyle = colors.weaponMetal;
    ctx.fillRect(shieldX - 6, shieldY - 8, 12, 2);
    ctx.fillRect(shieldX - 6, shieldY - 8, 2, 16);
    ctx.fillRect(shieldX + 4, shieldY - 8, 2, 16);
    ctx.fillRect(shieldX - 6, shieldY + 6, 12, 2);
    
    // Shield emblem
    ctx.fillStyle = colors.classSymbol;
    ctx.fillRect(shieldX - 2, shieldY - 4, 4, 8);
    ctx.fillRect(shieldX - 4, shieldY - 2, 8, 4);
  }
  
  /**
   * Draw staff (Fire Belly)
   */
  private static drawStaff(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    direction: string,
    action: string,
    colors: any
  ): void {
    // Staff position based on direction
    let staffX = centerX;
    let staffY = centerY;
    let staffRotation = 0;
    
    if (direction === 'right') {
      staffX = centerX + 14;
      staffY = centerY;
      staffRotation = 0;
    } else if (direction === 'left') {
      staffX = centerX - 14;
      staffY = centerY;
      staffRotation = Math.PI;
    } else if (direction === 'down') {
      staffX = centerX + 8;
      staffY = centerY + 14;
      staffRotation = Math.PI / 2;
    } else if (direction === 'up') {
      staffX = centerX + 8;
      staffY = centerY - 14;
      staffRotation = -Math.PI / 2;
    }
    
    // Save context for rotation
    ctx.save();
    ctx.translate(staffX, staffY);
    ctx.rotate(staffRotation);
    
    // Staff pole
    ctx.fillStyle = colors.weapon;
    ctx.fillRect(-1, -16, 2, 28);
    
    // Staff orb
    ctx.fillStyle = colors.weaponMetal;
    ctx.fillRect(-3, -18, 6, 6);
    ctx.fillRect(-4, -17, 8, 4);
    
    // Staff glow for cast
    if (action === 'cast') {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = colors.classSymbol;
      ctx.fillRect(-6, -20, 12, 10);
      ctx.globalAlpha = 1.0;
    }
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Draw magic effects
   */
  private static drawMagicEffects(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number,
    shellClass: string,
    colors: any
  ): void {
    // Magic particles
    ctx.fillStyle = colors.classSymbol;
    
    // Create 8 particles in a circle
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 20;
      const y = centerY + Math.sin(angle) * 20;
      
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillRect(x - 1, y - 3, 2, 6);
      ctx.fillRect(x - 3, y - 1, 6, 2);
    }
    
    // Magic aura
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fillStyle = colors.classSymbol;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}





