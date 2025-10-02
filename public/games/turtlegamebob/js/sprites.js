// ============================================================================
// SPRITE LOADING & MANAGEMENT
// Uses BrowserQuest sprites from master-sprites folder
// ============================================================================

const Sprites = {
    images: {},
    animations: {},
    loaded: false,
    loadProgress: 0,
    totalAssets: 0,

    // Load all game sprites
    async load() {
        console.log('🎨 Loading sprites...');
        const startTime = Date.now();

        try {
            // Load Bob player animations
            await this.loadBobAnimations();
            
            // Load enemy sprites
            await this.loadEnemySprites();
            
            // Load item sprites
            await this.loadItemSprites();
            
            // Load UI sprites
            await this.loadUISprites();

            this.loaded = true;
            const loadTime = Date.now() - startTime;
            console.log(`✅ All sprites loaded in ${loadTime}ms`);
            return true;
        } catch (error) {
            console.error('❌ Error loading sprites:', error);
            return false;
        }
    },

    // Load Bob the Turtle animations (BrowserQuest style)
    async loadBobAnimations() {
        console.log('Loading Bob animations...');
        
        // Idle animations (5 frames)
        await this.loadAnimation('bob_idle_down', 'player/bob_idle', 5);
        
        // Walk animations (4 frames each direction)
        await this.loadAnimation('bob_walk_down', 'player/bob_walk_down', 4);
        await this.loadAnimation('bob_walk_up', 'player/bob_walk_up', 4);
        await this.loadAnimation('bob_walk_left', 'player/bob_walk_left', 4);
        await this.loadAnimation('bob_walk_right', 'player/bob_walk_right', 4);
        
        // Attack animations (3 frames each direction)
        await this.loadAnimation('bob_atk_down', 'player/bob_atk_down', 3);
        await this.loadAnimation('bob_atk_up', 'player/bob_atk_up', 3);
        await this.loadAnimation('bob_atk_left', 'player/bob_atk_left', 3);
        await this.loadAnimation('bob_atk_right', 'player/bob_atk_right', 3);
        
        // Run animation (6 frames)
        await this.loadAnimation('bob_run', 'player/bob_run', 6);
        
        // Hit animation (3 frames)
        await this.loadAnimation('bob_hit', 'player/bob_hit', 3);
    },

    // Load enemy sprites
    async loadEnemySprites() {
        console.log('Loading enemy sprites...');
        
        // Goblin
        await this.loadImage('goblin', '1/goblin.png');
        
        // Skeleton
        await this.loadImage('skeleton', '1/skeleton.png');
        
        // Orc
        await this.loadImage('orc', '1/ogre.png');
        
        // Griffin (animated)
        await this.loadAnimation('griffin', 'enemies/griffin/adult', 6);
        
        // Boss
        await this.loadImage('boss', '1/boss.png');
    },

    // Load item sprites
    async loadItemSprites() {
        console.log('Loading item sprites...');
        
        // Potions
        await this.loadImage('health_potion', 'items/potion/0.png');
        
        // Weapons
        await this.loadImage('sword1', '1/item-sword1.png');
        await this.loadImage('sword2', '1/item-sword2.png');
        await this.loadImage('axe', '1/item-axe.png');
        await this.loadImage('goldensword', '1/item-goldensword.png');
        
        // Armor
        await this.loadImage('clotharmor', '1/item-clotharmor.png');
        await this.loadImage('leatherarmor', '1/item-leatherarmor.png');
        await this.loadImage('mailarmor', '1/item-mailarmor.png');
        await this.loadImage('platearmor', '1/item-platearmor.png');
        
        // Collectibles
        await this.loadImage('gold', 'objects/items/gold.png');
        await this.loadImage('diamond', 'objects/items/diamond.png');
        await this.loadImage('chest', '1/chest.png');
    },

    // Load UI sprites
    async loadUISprites() {
        console.log('Loading UI sprites...');
        
        // Hearts (4 states)
        await this.loadImage('heart_full', 'ui/heart/0.png');
        await this.loadImage('heart_2/3', 'ui/heart/1.png');
        await this.loadImage('heart_1/3', 'ui/heart/2.png');
        await this.loadImage('heart_empty', 'ui/heart/3.png');
    },

    // Load animation (multiple frames)
    async loadAnimation(name, basePath, frameCount) {
        this.animations[name] = [];
        for (let i = 0; i < frameCount; i++) {
            const img = await this.loadImage(`${name}_${i}`, `master-sprites/${basePath}/${i}.png`);
            this.animations[name].push(img);
        }
        console.log(`  ✓ Loaded animation: ${name} (${frameCount} frames)`);
    },

    // Load single image
    async loadImage(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loadProgress++;
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load: ${path}`);
                reject(new Error(`Failed to load ${path}`));
            };
            
            // Add master-sprites prefix if not already there
            if (!path.startsWith('master-sprites/')) {
                img.src = `master-sprites/${path}`;
            } else {
                img.src = path;
            }
        });
    },

    // Draw animated sprite
    drawAnimation(ctx, animName, frame, x, y, scale = 1) {
        const animation = this.animations[animName];
        if (!animation || !animation[frame]) {
            console.warn(`Animation not found: ${animName} frame ${frame}`);
            return;
        }
        
        const img = animation[frame];
        const width = img.width * scale;
        const height = img.height * scale;
        
        ctx.drawImage(img, 
            x - width / 2, 
            y - height / 2, 
            width, 
            height
        );
    },

    // Draw static sprite
    drawSprite(ctx, spriteName, x, y, scale = 1) {
        const img = this.images[spriteName];
        if (!img) {
            console.warn(`Sprite not found: ${spriteName}`);
            return;
        }
        
        const width = img.width * scale;
        const height = img.height * scale;
        
        ctx.drawImage(img, 
            x - width / 2, 
            y - height / 2, 
            width, 
            height
        );
    },

    // Get animation frame count
    getFrameCount(animName) {
        return this.animations[animName]?.length || 0;
    }
};

