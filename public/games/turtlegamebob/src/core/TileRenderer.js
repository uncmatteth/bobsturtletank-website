// Map tile rendering system
import { TILES } from '../config/Constants.js';

export class TileRenderer {
    constructor(scene) {
        this.scene = scene;
        this.tileSprites = [];
    }

    renderMap() {
        this.clearExistingTiles();
        const map = this.scene.gameState.gameMap;
        
        for (let x = 0; x < map.length; x++) {
            for (let y = 0; y < map[0].length; y++) {
                this.renderTile(x, y, map[x][y]);
            }
        }
    }

    clearExistingTiles() {
        this.tileSprites.forEach(sprite => sprite.destroy());
        this.tileSprites = [];
    }

    renderTile(x, y, tileType) {
        const textureKey = this.getTextureForTile(tileType);
        if (!textureKey) return;

        const sprite = this.scene.add.sprite(
            x * 48 + 24,
            y * 48 + 24,
            textureKey
        );
        sprite.setDepth(10);
        
        this.applyTileEffects(sprite, tileType);
        this.tileSprites.push(sprite);
    }

    getTextureForTile(tileType) {
        switch (tileType) {
            case TILES.FLOOR: return 'tileset_floor';
            case TILES.WALL: return 'tileset_wall';
            case TILES.WATER:
            case TILES.DEEP_WATER: return 'tileset_water';
            case TILES.STAIRS_DOWN: return 'tileset_stairs';
            case TILES.AIR_POCKET: return 'tileset_floor';
            case TILES.TREASURE_FLOOR: return 'tileset_floor';
            default: return null;
        }
    }

    applyTileEffects(sprite, tileType) {
        if (tileType === TILES.TREASURE_FLOOR) {
            sprite.setTint(0xffd700); // Gold tint
        } else if (tileType === TILES.AIR_POCKET) {
            sprite.setTint(0x87ceeb); // Sky blue tint
        }
    }
}
