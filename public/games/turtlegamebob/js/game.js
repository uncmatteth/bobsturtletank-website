// ============================================================================
// MAIN GAME LOOP
// Initialization, update, render
// ============================================================================

const Game = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    fps: 60,
    fpsTimer: 0,
    fpsCounter: 0,
    debugMode: false,
    gameState: 'loading', // loading, playing, paused, gameover
    camera: { x: 0, y: 0 },
    
    async init() {
        console.log('🐢 Initializing Bob\'s Roguelike...');
        
        // Get canvas
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size (responsive for mobile)
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log(`Canvas: ${this.canvas.width}x${this.canvas.height}`);
        
        // Initialize input
        Input.init();
        
        // Load sprites
        const loaded = await Sprites.load();
        if (!loaded) {
            console.error('Failed to load sprites!');
            return;
        }
        
        // Hide loading screen
        document.getElementById('loading').classList.add('hidden');
        
        // Start new game
        this.newGame();
        
        // Start game loop
        this.gameState = 'playing';
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        
        console.log('✅ Game initialized! Use WASD/Arrows to move, Space to attack');
    },
    
    newGame() {
        console.log('🎮 Starting new game...');
        
        // Clear inventory
        Inventory.clear();
        
        // Generate first floor
        Dungeon.generate(1);
        
        // Initialize player in center of first room
        const startRoom = Dungeon.rooms[0];
        if (startRoom) {
            const startX = (startRoom.x + startRoom.width / 2) * Dungeon.tileSize;
            const startY = (startRoom.y + startRoom.height / 2) * Dungeon.tileSize;
            Player.init(startX, startY);
        }
        
        this.gameState = 'playing';
        console.log('✅ New game started!');
    },
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        const dt = Math.min(deltaTime / 1000, 0.1); // Cap at 0.1s
        this.lastTime = timestamp;
        
        // Update FPS counter
        this.fpsCounter++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1000) {
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTimer = 0;
        }
        
        // Update game state
        if (this.gameState === 'playing') {
            this.update(dt);
        }
        
        // Render everything
        this.render();
        
        // Continue loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    },
    
    update(dt) {
        // Handle input
        this.handleInput();
        
        // Update player
        Player.update(dt);
        
        // Update enemies
        Enemy.update(dt);
        
        // Check item pickups
        Inventory.checkPickups();
        
        // Update effects
        Effects.update(dt);
        
        // Update camera (follow player)
        this.updateCamera();
    },
    
    handleInput() {
        // Attack
        if (Input.isAttackPressed()) {
            Player.attack();
        }
        
        // Interact (go down stairs)
        if (Input.isInteractPressed() && !Player.isDead) {
            if (Dungeon.isOnStairs(Player.x, Player.y)) {
                this.nextFloor();
            }
        }
        
        // Inventory
        if (Input.isInventoryPressed() && !Player.isDead) {
            UI.toggleInventory();
        }
        
        // Restart (when dead)
        if (Player.isDead && Input.isKeyDown('r')) {
            this.newGame();
        }
        
        // Debug toggle
        if (Input.isKeyDown('`')) {
            this.debugMode = !this.debugMode;
        }
    },
    
    nextFloor() {
        console.log(`⬇️ Descending to floor ${Dungeon.currentFloor + 1}...`);
        
        // Generate next floor
        Dungeon.generate(Dungeon.currentFloor + 1);
        
        // Place player in first room
        const startRoom = Dungeon.rooms[0];
        if (startRoom) {
            const startX = (startRoom.x + startRoom.width / 2) * Dungeon.tileSize;
            const startY = (startRoom.y + startRoom.height / 2) * Dungeon.tileSize;
            Player.x = startX;
            Player.y = startY;
        }
        
        // Heal player a bit
        Player.heal(20);
    },
    
    updateCamera() {
        // Center camera on player
        this.camera.x = Player.x - this.canvas.width / 2;
        this.camera.y = Player.y - this.canvas.height / 2;
        
        // Clamp camera to dungeon bounds
        const maxX = Dungeon.width * Dungeon.tileSize - this.canvas.width;
        const maxY = Dungeon.height * Dungeon.tileSize - this.canvas.height;
        this.camera.x = clamp(this.camera.x, 0, maxX);
        this.camera.y = clamp(this.camera.y, 0, maxY);
    },
    
    render() {
        // Clear screen
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply camera transform (with screen shake)
        this.ctx.translate(
            -this.camera.x + Effects.screenShake.x, 
            -this.camera.y + Effects.screenShake.y
        );
        
        // Render world (with camera offset)
        Dungeon.render(this.ctx);
        Inventory.render(this.ctx); // Items on ground
        Enemy.render(this.ctx);
        Player.render(this.ctx);
        Effects.render(this.ctx); // Particles and damage numbers
        
        // Restore context state
        this.ctx.restore();
        
        // Render UI (no camera offset)
        UI.render(this.ctx);
        
        // Game over screen
        if (Player.isDead) {
            UI.drawGameOver(this.ctx);
        }
    },
    
    gameOver() {
        this.gameState = 'gameover';
        console.log('💀 GAME OVER');
    },
    
    resizeCanvas() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Full screen on mobile
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        } else {
            // Desktop size
            this.canvas.width = 1280;
            this.canvas.height = 720;
        }
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
    }
};

// Start game when page loads
window.addEventListener('load', () => {
    Game.init();
});

