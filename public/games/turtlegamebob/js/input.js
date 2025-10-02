// ============================================================================
// INPUT HANDLING
// Keyboard and mouse input
// ============================================================================

const Input = {
    keys: {},
    mouse: { x: 0, y: 0, pressed: false },

    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent arrow keys from scrolling page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse events (for UI)
        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
        });

        window.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });

        console.log('✅ Input system initialized');
    },

    // Check if key is currently pressed
    isKeyDown(key) {
        return this.keys[key.toLowerCase()] === true;
    },

    // Get movement input as direction vector
    getMovementInput() {
        let x = 0;
        let y = 0;

        // Arrow keys or WASD
        if (this.isKeyDown('arrowleft') || this.isKeyDown('a')) x -= 1;
        if (this.isKeyDown('arrowright') || this.isKeyDown('d')) x += 1;
        if (this.isKeyDown('arrowup') || this.isKeyDown('w')) y -= 1;
        if (this.isKeyDown('arrowdown') || this.isKeyDown('s')) y += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }

        return { x, y };
    },

    // Check if attack button pressed
    isAttackPressed() {
        return this.isKeyDown(' ') || this.isKeyDown('enter');
    },

    // Check if inventory button pressed
    isInventoryPressed() {
        return this.isKeyDown('i');
    },

    // Check if pause button pressed
    isPausePressed() {
        return this.isKeyDown('escape');
    },

    // Check if interact button pressed
    isInteractPressed() {
        return this.isKeyDown('e');
    },

    // Get quick item hotkey (1-4)
    getQuickItemKey() {
        if (this.isKeyDown('1')) return 0;
        if (this.isKeyDown('2')) return 1;
        if (this.isKeyDown('3')) return 2;
        if (this.isKeyDown('4')) return 3;
        return -1;
    }
};

