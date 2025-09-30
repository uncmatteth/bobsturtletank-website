/**
 * TilesetGenerator - Creates professional-looking dungeon tilesets
 * Generates detailed tileset for dungeon floors
 */

export class TilesetGenerator {
  /**
   * Generate a dungeon tileset
   */
  public static generateDungeonTileset(width: number = 256, height: number = 256): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Create a 4x4 grid of different tile types
    const tileSize = 32;
    
    // Draw floor tiles (row 0)
    this.drawFloorTile(ctx, 0, 0, 'stone');
    this.drawFloorTile(ctx, tileSize, 0, 'dirt');
    this.drawFloorTile(ctx, tileSize * 2, 0, 'water');
    this.drawFloorTile(ctx, tileSize * 3, 0, 'lava');
    
    // Draw wall tiles (row 1)
    this.drawWallTile(ctx, 0, tileSize, 'stone');
    this.drawWallTile(ctx, tileSize, tileSize, 'brick');
    this.drawWallTile(ctx, tileSize * 2, tileSize, 'ice');
    this.drawWallTile(ctx, tileSize * 3, tileSize, 'crystal');
    
    // Draw special tiles (row 2)
    this.drawSpecialTile(ctx, 0, tileSize * 2, 'entrance');
    this.drawSpecialTile(ctx, tileSize, tileSize * 2, 'exit');
    this.drawSpecialTile(ctx, tileSize * 2, tileSize * 2, 'chest');
    this.drawSpecialTile(ctx, tileSize * 3, tileSize * 2, 'altar');
    
    // Draw decoration tiles (row 3)
    this.drawDecorationTile(ctx, 0, tileSize * 3, 'torch');
    this.drawDecorationTile(ctx, tileSize, tileSize * 3, 'bones');
    this.drawDecorationTile(ctx, tileSize * 2, tileSize * 3, 'web');
    this.drawDecorationTile(ctx, tileSize * 3, tileSize * 3, 'crack');
    
    // Draw environment-specific tiles (row 4)
    this.drawEnvironmentTile(ctx, 0, tileSize * 4, 'shallow');
    this.drawEnvironmentTile(ctx, tileSize, tileSize * 4, 'deep');
    this.drawEnvironmentTile(ctx, tileSize * 2, tileSize * 4, 'abyss');
    this.drawEnvironmentTile(ctx, tileSize * 3, tileSize * 4, 'volcanic');
    
    // Draw more environment tiles (row 5)
    this.drawEnvironmentTile(ctx, 0, tileSize * 5, 'frozen');
    this.drawEnvironmentTile(ctx, tileSize, tileSize * 5, 'crystal');
    this.drawEnvironmentTile(ctx, tileSize * 2, tileSize * 5, 'void');
    this.drawEnvironmentTile(ctx, tileSize * 3, tileSize * 5, 'boss');
    
    // Draw wall variations (row 6)
    this.drawWallVariation(ctx, 0, tileSize * 6, 'top');
    this.drawWallVariation(ctx, tileSize, tileSize * 6, 'right');
    this.drawWallVariation(ctx, tileSize * 2, tileSize * 6, 'bottom');
    this.drawWallVariation(ctx, tileSize * 3, tileSize * 6, 'left');
    
    // Draw corner tiles (row 7)
    this.drawCornerTile(ctx, 0, tileSize * 7, 'top-left');
    this.drawCornerTile(ctx, tileSize, tileSize * 7, 'top-right');
    this.drawCornerTile(ctx, tileSize * 2, tileSize * 7, 'bottom-right');
    this.drawCornerTile(ctx, tileSize * 3, tileSize * 7, 'bottom-left');
    
    return canvas.toDataURL();
  }
  
  /**
   * Draw a floor tile
   */
  private static drawFloorTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
  ): void {
    let baseColor = '#8B6B4F';
    let patternColor = '#7A5A3E';
    let highlightColor = '#9C7C60';
    
    switch (type) {
      case 'dirt':
        baseColor = '#8B7355';
        patternColor = '#7A6245';
        highlightColor = '#9C8466';
        break;
      case 'water':
        baseColor = '#4F6B8B';
        patternColor = '#3E5A7A';
        highlightColor = '#607C9C';
        break;
      case 'lava':
        baseColor = '#8B4F4F';
        patternColor = '#7A3E3E';
        highlightColor = '#9C6060';
        break;
    }
    
    // Base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, 32, 32);
    
    // Pattern
    ctx.fillStyle = patternColor;
    
    // Draw small stones/variations
    for (let i = 0; i < 8; i++) {
      const stoneX = x + Math.random() * 32;
      const stoneY = y + Math.random() * 32;
      const stoneSize = 1 + Math.random() * 2;
      ctx.fillRect(stoneX, stoneY, stoneSize, stoneSize);
    }
    
    // Draw some cracks
    for (let i = 0; i < 2; i++) {
      const crackX = x + 5 + Math.random() * 22;
      const crackY = y + 5 + Math.random() * 22;
      const crackLength = 3 + Math.random() * 5;
      const crackAngle = Math.random() * Math.PI * 2;
      
      ctx.fillRect(
        crackX, 
        crackY, 
        Math.cos(crackAngle) * crackLength, 
        Math.sin(crackAngle) * crackLength
      );
    }
    
    // Highlights
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x + 2, y + 2, 2, 2);
    ctx.fillRect(x + 28, y + 28, 2, 2);
    ctx.fillRect(x + 10, y + 20, 2, 2);
    ctx.fillRect(x + 20, y + 10, 2, 2);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.strokeRect(x, y, 32, 32);
  }
  
  /**
   * Draw a wall tile
   */
  private static drawWallTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
  ): void {
    let baseColor = '#666666';
    let darkColor = '#444444';
    let highlightColor = '#888888';
    let patternStyle = 'brick';
    
    switch (type) {
      case 'brick':
        baseColor = '#8B5A4F';
        darkColor = '#7A493E';
        highlightColor = '#9C6B60';
        patternStyle = 'brick';
        break;
      case 'ice':
        baseColor = '#AADDEE';
        darkColor = '#99CCDD';
        highlightColor = '#BBEEEE';
        patternStyle = 'smooth';
        break;
      case 'crystal':
        baseColor = '#BB88CC';
        darkColor = '#AA77BB';
        highlightColor = '#CC99DD';
        patternStyle = 'crystal';
        break;
    }
    
    // Base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, 32, 32);
    
    // Pattern
    ctx.fillStyle = darkColor;
    
    if (patternStyle === 'brick') {
      // Brick pattern
      ctx.fillRect(x + 0, y + 8, 32, 1);
      ctx.fillRect(x + 0, y + 20, 32, 1);
      ctx.fillRect(x + 16, y + 0, 1, 8);
      ctx.fillRect(x + 8, y + 8, 1, 12);
      ctx.fillRect(x + 24, y + 8, 1, 12);
      ctx.fillRect(x + 16, y + 20, 1, 12);
    } else if (patternStyle === 'crystal') {
      // Crystal pattern
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 0);
      ctx.lineTo(x + 32, y + 16);
      ctx.lineTo(x + 16, y + 32);
      ctx.lineTo(x + 0, y + 16);
      ctx.closePath();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 8);
      ctx.lineTo(x + 24, y + 16);
      ctx.lineTo(x + 16, y + 24);
      ctx.lineTo(x + 8, y + 16);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Smooth pattern
      for (let i = 0; i < 5; i++) {
        const lineX = x + Math.random() * 32;
        const lineY = y + Math.random() * 32;
        const lineLength = 5 + Math.random() * 10;
        const lineAngle = Math.random() * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(
          lineX + Math.cos(lineAngle) * lineLength,
          lineY + Math.sin(lineAngle) * lineLength
        );
        ctx.stroke();
      }
    }
    
    // Highlights
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x + 0, y + 0, 32, 2);
    ctx.fillRect(x + 0, y + 0, 2, 32);
    
    // Border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.strokeRect(x, y, 32, 32);
  }
  
  /**
   * Draw a special tile (entrance, exit, chest, etc.)
   */
  private static drawSpecialTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
  ): void {
    // First draw a floor tile as background
    this.drawFloorTile(ctx, x, y, 'stone');
    
    switch (type) {
      case 'entrance':
        // Draw stairs up
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + 8, y + 8, 16, 4);
        ctx.fillRect(x + 8, y + 16, 16, 4);
        ctx.fillRect(x + 8, y + 24, 16, 4);
        
        // Arrow up
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14, y + 12, 4, 8);
        ctx.fillRect(x + 12, y + 14, 8, 4);
        break;
      
      case 'exit':
        // Draw stairs down
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 8, y + 8, 16, 16);
        
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 8, y + 8, 16, 4);
        ctx.fillRect(x + 8, y + 16, 16, 4);
        ctx.fillRect(x + 8, y + 24, 16, 4);
        
        // Arrow down
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 14, y + 12, 4, 8);
        ctx.fillRect(x + 12, y + 16, 8, 4);
        break;
      
      case 'chest':
        // Draw chest
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 8, y + 12, 16, 12);
        
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 8, y + 12, 16, 4);
        
        // Lock
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 14, y + 14, 4, 4);
        break;
      
      case 'altar':
        // Draw altar
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x + 8, y + 16, 16, 8);
        
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(x + 10, y + 12, 12, 4);
        
        // Glow
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 16, y + 14, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
  
  /**
   * Draw a decoration tile (torch, bones, etc.)
   */
  private static drawDecorationTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
  ): void {
    // First draw a floor tile as background
    this.drawFloorTile(ctx, x, y, 'stone');
    
    switch (type) {
      case 'torch':
        // Draw torch
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 14, y + 16, 4, 12);
        
        // Flame
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(x + 12, y + 10, 8, 6);
        ctx.fillRect(x + 14, y + 6, 4, 4);
        
        // Glow
        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 16, y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'bones':
        // Draw bones
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 10, y + 16, 12, 3);
        ctx.fillRect(x + 18, y + 12, 3, 10);
        
        ctx.fillRect(x + 8, y + 22, 6, 3);
        ctx.fillRect(x + 20, y + 22, 6, 3);
        
        // Skull
        ctx.fillRect(x + 14, y + 8, 6, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 15, y + 10, 1, 1);
        ctx.fillRect(x + 18, y + 10, 1, 1);
        break;
      
      case 'web':
        // Draw spider web
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        
        // Radial lines
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.moveTo(x + 16, y + 16);
          ctx.lineTo(
            x + 16 + Math.cos(angle) * 16,
            y + 16 + Math.sin(angle) * 16
          );
        }
        
        // Concentric circles
        for (let r = 4; r <= 16; r += 4) {
          ctx.moveTo(x + 16 + r, y + 16);
          ctx.arc(x + 16, y + 16, r, 0, Math.PI * 2);
        }
        
        ctx.stroke();
        break;
      
      case 'crack':
        // Draw cracks
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        // Main crack
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 4);
        ctx.lineTo(x + 18, y + 10);
        ctx.lineTo(x + 24, y + 16);
        ctx.lineTo(x + 20, y + 22);
        ctx.lineTo(x + 24, y + 28);
        ctx.stroke();
        
        // Branch cracks
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 10);
        ctx.lineTo(x + 12, y + 14);
        ctx.lineTo(x + 8, y + 12);
        ctx.moveTo(x + 20, y + 22);
        ctx.lineTo(x + 14, y + 20);
        ctx.lineTo(x + 10, y + 24);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        break;
    }
  }
  
  /**
   * Draw an environment-specific tile
   */
  private static drawEnvironmentTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: string
  ): void {
    let baseColor = '#8B6B4F';
    let patternColor = '#7A5A3E';
    let accentColor = '#9C7C60';
    
    switch (type) {
      case 'shallow':
        baseColor = '#4F6B8B';
        patternColor = '#3E5A7A';
        accentColor = '#ADD8E6';
        break;
      case 'deep':
        baseColor = '#2F4F6B';
        patternColor = '#1E3E5A';
        accentColor = '#4F6B8B';
        break;
      case 'abyss':
        baseColor = '#191970';
        patternColor = '#0F0F4B';
        accentColor = '#483D8B';
        break;
      case 'volcanic':
        baseColor = '#8B2500';
        patternColor = '#7A1E00';
        accentColor = '#FF4500';
        break;
      case 'frozen':
        baseColor = '#ADD8E6';
        patternColor = '#87CEEB';
        accentColor = '#F0F8FF';
        break;
      case 'crystal':
        baseColor = '#9370DB';
        patternColor = '#8A2BE2';
        accentColor = '#E6E6FA';
        break;
      case 'void':
        baseColor = '#2F2F2F';
        patternColor = '#1F1F1F';
        accentColor = '#4B0082';
        break;
      case 'boss':
        baseColor = '#8B0000';
        patternColor = '#7A0000';
        accentColor = '#FF0000';
        break;
    }
    
    // Base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, 32, 32);
    
    // Pattern
    ctx.fillStyle = patternColor;
    
    // Environment-specific patterns
    if (type === 'shallow' || type === 'deep') {
      // Water ripples
      for (let i = 0; i < 3; i++) {
        const centerX = x + 8 + Math.random() * 16;
        const centerY = y + 8 + Math.random() * 16;
        const radius = 2 + Math.random() * 4;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === 'volcanic') {
      // Lava cracks
      for (let i = 0; i < 5; i++) {
        const crackX = x + Math.random() * 32;
        const crackY = y + Math.random() * 32;
        const crackLength = 4 + Math.random() * 8;
        const crackAngle = Math.random() * Math.PI * 2;
        
        ctx.fillRect(
          crackX, 
          crackY, 
          Math.cos(crackAngle) * crackLength, 
          Math.sin(crackAngle) * crackLength
        );
      }
    } else if (type === 'crystal' || type === 'frozen') {
      // Crystal/ice facets
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + 28, y + 16);
      ctx.lineTo(x + 16, y + 28);
      ctx.lineTo(x + 4, y + 16);
      ctx.closePath();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 10);
      ctx.lineTo(x + 22, y + 16);
      ctx.lineTo(x + 16, y + 22);
      ctx.lineTo(x + 10, y + 16);
      ctx.closePath();
      ctx.stroke();
    } else if (type === 'void') {
      // Void swirls
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 1.5);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 8, Math.PI, Math.PI * 2.5);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'boss') {
      // Boss runes
      ctx.fillRect(x + 12, y + 8, 8, 2);
      ctx.fillRect(x + 14, y + 8, 4, 16);
      
      ctx.fillRect(x + 8, y + 22, 16, 2);
      
      ctx.fillRect(x + 22, y + 12, 2, 8);
      ctx.fillRect(x + 8, y + 12, 2, 8);
    }
    
    // Accent highlights
    ctx.fillStyle = accentColor;
    
    for (let i = 0; i < 6; i++) {
      const highlightX = x + Math.random() * 32;
      const highlightY = y + Math.random() * 32;
      const highlightSize = 1 + Math.random() * 2;
      
      ctx.fillRect(highlightX, highlightY, highlightSize, highlightSize);
    }
    
    // Grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.strokeRect(x, y, 32, 32);
  }
  
  /**
   * Draw a wall variation (top, right, bottom, left)
   */
  private static drawWallVariation(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    variation: string
  ): void {
    // First draw a stone wall
    this.drawWallTile(ctx, x, y, 'stone');
    
    // Then add variation
    ctx.fillStyle = '#8B6B4F'; // Floor color
    
    switch (variation) {
      case 'top':
        ctx.fillRect(x, y, 32, 8);
        break;
      case 'right':
        ctx.fillRect(x + 24, y, 8, 32);
        break;
      case 'bottom':
        ctx.fillRect(x, y + 24, 32, 8);
        break;
      case 'left':
        ctx.fillRect(x, y, 8, 32);
        break;
    }
    
    // Add some texture to the floor part
    ctx.fillStyle = '#7A5A3E';
    
    for (let i = 0; i < 3; i++) {
      let dotX, dotY;
      
      switch (variation) {
        case 'top':
          dotX = x + Math.random() * 32;
          dotY = y + Math.random() * 8;
          break;
        case 'right':
          dotX = x + 24 + Math.random() * 8;
          dotY = y + Math.random() * 32;
          break;
        case 'bottom':
          dotX = x + Math.random() * 32;
          dotY = y + 24 + Math.random() * 8;
          break;
        case 'left':
          dotX = x + Math.random() * 8;
          dotY = y + Math.random() * 32;
          break;
        default:
          dotX = x + Math.random() * 32;
          dotY = y + Math.random() * 32;
      }
      
      ctx.fillRect(dotX, dotY, 1, 1);
    }
  }
  
  /**
   * Draw a corner tile
   */
  private static drawCornerTile(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    corner: string
  ): void {
    // First draw a stone wall
    this.drawWallTile(ctx, x, y, 'stone');
    
    // Then add corner
    ctx.fillStyle = '#8B6B4F'; // Floor color
    
    switch (corner) {
      case 'top-left':
        ctx.fillRect(x, y, 16, 16);
        break;
      case 'top-right':
        ctx.fillRect(x + 16, y, 16, 16);
        break;
      case 'bottom-right':
        ctx.fillRect(x + 16, y + 16, 16, 16);
        break;
      case 'bottom-left':
        ctx.fillRect(x, y + 16, 16, 16);
        break;
    }
    
    // Add some texture to the floor part
    ctx.fillStyle = '#7A5A3E';
    
    for (let i = 0; i < 3; i++) {
      let dotX, dotY;
      
      switch (corner) {
        case 'top-left':
          dotX = x + Math.random() * 16;
          dotY = y + Math.random() * 16;
          break;
        case 'top-right':
          dotX = x + 16 + Math.random() * 16;
          dotY = y + Math.random() * 16;
          break;
        case 'bottom-right':
          dotX = x + 16 + Math.random() * 16;
          dotY = y + 16 + Math.random() * 16;
          break;
        case 'bottom-left':
          dotX = x + Math.random() * 16;
          dotY = y + 16 + Math.random() * 16;
          break;
        default:
          dotX = x + Math.random() * 32;
          dotY = y + Math.random() * 32;
      }
      
      ctx.fillRect(dotX, dotY, 1, 1);
    }
  }
}





