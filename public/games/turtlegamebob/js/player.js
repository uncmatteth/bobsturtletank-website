// ============================================================================
// PLAYER (Bob the Turtle)
// Movement, animation, stats
// ============================================================================

const Player = {
    // Position
    x: 400,
    y: 300,
    
    // Stats
    health: 100,
    maxHealth: 100,
    damage: 20,
    defense: 0,
    speed: 150, // pixels per second
    
    // State
    direction: 'down', // down, up, left, right
    isMoving: false,
    isAttacking: false,
    isDead: false,
    
    // Animation
    currentAnim: 'bob_idle_down',
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 0.1, // seconds per frame
    
    // Inventory
    inventory: [],
    equippedWeapon: null,
    equippedArmor: null,
    
    // Attack cooldown
    attackCooldown: 0,
    attackDuration: 0.3, // seconds
    
    init(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.isDead = false;
        this.isAttacking = false;
        this.direction = 'down';
        this.currentAnim = 'bob_idle_down';
        this.frameIndex = 0;
        console.log('✅ Player initialized at', x, y);
    },
    
    update(dt) {
        if (this.isDead) return;
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
            if (this.attackCooldown <= 0) {
                this.isAttacking = false;
            }
        }
        
        // Handle movement if not attacking
        if (!this.isAttacking) {
            this.handleMovement(dt);
        }
        
        // Update animation
        this.updateAnimation(dt);
    },
    
    handleMovement(dt) {
        const input = Input.getMovementInput();
        
        // Check if moving
        this.isMoving = (input.x !== 0 || input.y !== 0);
        
        if (this.isMoving) {
            // Calculate new position
            const newX = this.x + input.x * this.speed * dt;
            const newY = this.y + input.y * this.speed * dt;
            
            // Check collision (will implement in dungeon.js)
            if (Dungeon.canMoveTo(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
            
            // Update direction based on movement
            if (Math.abs(input.x) > Math.abs(input.y)) {
                this.direction = input.x > 0 ? 'right' : 'left';
            } else {
                this.direction = input.y > 0 ? 'down' : 'up';
            }
        }
    },
    
    updateAnimation(dt) {
        // Determine which animation to play
        let animName;
        if (this.isAttacking) {
            animName = `bob_atk_${this.direction}`;
        } else if (this.isMoving) {
            animName = `bob_walk_${this.direction}`;
        } else {
            animName = `bob_idle_down`; // Bob idle animation (only has down)
        }
        
        // Reset frame if animation changed
        if (this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.frameIndex = 0;
            this.frameTimer = 0;
        }
        
        // Update frame timer
        this.frameTimer += dt;
        if (this.frameTimer >= this.frameDuration) {
            this.frameTimer = 0;
            this.frameIndex++;
            
            // Loop animation
            const frameCount = Sprites.getFrameCount(this.currentAnim);
            if (this.frameIndex >= frameCount) {
                this.frameIndex = 0;
                
                // Stop attacking after animation completes
                if (this.isAttacking) {
                    this.isAttacking = false;
                }
            }
        }
    },
    
    attack() {
        if (this.isAttacking || this.attackCooldown > 0) return;
        
        this.isAttacking = true;
        this.attackCooldown = this.attackDuration;
        this.frameIndex = 0;
        
        // Trigger combat system
        Combat.playerAttack();
    },
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        const actualDamage = Math.max(1, amount - this.defense);
        this.health -= actualDamage;
        
        console.log(`Player took ${actualDamage} damage! (${this.health}/${this.maxHealth} HP)`);
        
        // Check death
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return actualDamage;
    },
    
    heal(amount) {
        if (this.isDead) return;
        
        this.health = Math.min(this.health + amount, this.maxHealth);
        console.log(`Player healed ${amount} HP! (${this.health}/${this.maxHealth} HP)`);
    },
    
    die() {
        this.isDead = true;
        console.log('💀 Player died!');
        Game.gameOver();
    },
    
    render(ctx) {
        if (this.isDead) return;
        
        // Draw sprite centered on position
        Sprites.drawAnimation(ctx, this.currentAnim, this.frameIndex, this.x, this.y, 2);
        
        // Debug: draw hitbox
        if (Game.debugMode) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(this.x - 16, this.y - 16, 32, 32);
        }
    },
    
    // Get player hitbox for collision
    getHitbox() {
        return {
            x: this.x - 16,
            y: this.y - 16,
            width: 32,
            height: 32
        };
    }
};

