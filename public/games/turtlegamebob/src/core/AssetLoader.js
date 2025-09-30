// Asset loading - 50 lines max
export class AssetLoader {
    constructor(scene) {
        this.scene = scene;
    }

    loadAllAssets() {
        this.loadTileAssets();
        this.loadCharacterAssets();
        this.loadItemAssets();
        this.loadAudioAssets();
        
        // Add load event to see what's happening
        this.scene.load.on('complete', () => {
            console.log('✅ All assets loaded successfully!');
            console.log('Available textures:', Object.keys(this.scene.textures.list));
        });
        
        this.scene.load.on('filefailed', (file) => {
            console.error('❌ Failed to load:', file.key, file.src);
        });
        
        console.log('🎨 Loading game assets...');
    }

    loadTileAssets() {
        this.scene.load.image('tileset_floor', 'assets/extracted/environment/rotations/south.png');
        this.scene.load.image('tileset_wall', 'assets/extracted/environment/rotations/north.png');
        this.scene.load.image('tileset_water', 'assets/extracted/environment/rotations/east.png');
        this.scene.load.image('tileset_stairs', 'assets/extracted/environment/rotations/west.png');
    }

    loadCharacterAssets() {
        const heroDirections = ['south', 'west', 'east', 'north'];
        heroDirections.forEach(direction => {
            this.scene.load.image(`hero_${direction}`, `assets/extracted/green_turtle/rotations/${direction}.png`);
        });

        const enemies = ['fish', 'crab', 'lobster', 'eel', 'witch', 'boss'];
        enemies.forEach(enemy => {
            heroDirections.forEach(direction => {
                this.scene.load.image(`enemy_${enemy}_${direction}`, `assets/extracted/enemies/rotations/${direction}.png`);
            });
        });
    }

    loadItemAssets() {
        const items = ['weapon', 'armor', 'potion', 'ring', 'scroll', 'gold'];
        items.forEach(item => {
            this.scene.load.image(`item_${item}`, `assets/extracted/items/rotations/south.png`);
        });
    }

    loadAudioAssets() {
        // Load background music - fix paths
        this.scene.load.audio('background_music', [
            'public/assets/music/1.mp3',
            'public/assets/music/2.mp3',
            'public/assets/music/3.mp3'
        ]);
        
        // Load sound effects from correct location
        this.scene.load.audio('sword_hit', 'public/assets/sfx/sword_hit.ogg');
        this.scene.load.audio('level_up', 'public/assets/sfx/level_up.ogg');
        this.scene.load.audio('achievement_unlock', 'public/assets/sfx/achievement_unlock.ogg');
    }


}
