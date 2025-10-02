// ============================================================================
// INPUT HANDLING
// Keyboard, mouse, touch, and virtual joystick (nipplejs)
// ============================================================================

const Input = {
    keys: {},
    mouse: { x: 0, y: 0, pressed: false },
    touch: { x: 0, y: 0, active: false },
    joystick: { x: 0, y: 0 },
    isMobile: false,
    controlMode: 'joystick', // 'joystick', 'tap', 'both'
    joystickManager: null,

    init() {
        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || ('ontouchstart' in window) 
                     || (navigator.maxTouchPoints > 0);
        
        console.log(`📱 Device: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
        
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

        // Mouse events
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            if (this.isMobile && (this.controlMode === 'tap' || this.controlMode === 'both')) {
                this.handleTapToMove(e);
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });

        // Touch events for tap-to-move
        canvas.addEventListener('touchstart', (e) => {
            if (this.controlMode === 'tap' || this.controlMode === 'both') {
                this.handleTapToMove(e);
            }
        });

        // Initialize mobile controls if needed
        if (this.isMobile) {
            this.initMobileControls();
        }

        console.log('✅ Input system initialized');
    },

    initMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'block';
        }

        // Load control mode from localStorage
        const savedMode = localStorage.getItem('controlMode') || 'joystick';
        this.controlMode = savedMode;
        document.querySelector(`input[value="${savedMode}"]`)?.setAttribute('checked', 'checked');

        // Initialize virtual joystick (nipplejs)
        if (typeof nipplejs !== 'undefined') {
            this.initJoystick();
        }

        // Attack button
        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[' '] = true;
            });
            attackBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[' '] = false;
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
            });

            closeSettings.addEventListener('click', () => {
                settingsModal.style.display = 'none';
            });

            // Control mode radio buttons
            document.querySelectorAll('input[name="control-mode"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.controlMode = e.target.value;
                    localStorage.setItem('controlMode', this.controlMode);
                    console.log(`🎮 Control mode: ${this.controlMode}`);
                    
                    // Update joystick visibility
                    this.updateJoystickVisibility();
                });
            });
        }

        this.updateJoystickVisibility();
    },

    initJoystick() {
        const joystickZone = document.getElementById('joystick-zone');
        if (!joystickZone) return;

        this.joystickManager = nipplejs.create({
            zone: joystickZone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: '#00d4ff',
            size: 120,
            restOpacity: 0.7
        });

        this.joystickManager.on('move', (evt, data) => {
            if (this.controlMode !== 'tap') {
                const force = Math.min(data.force, 2) / 2; // Normalize to 0-1
                const angle = data.angle.radian;
                this.joystick.x = Math.cos(angle) * force;
                this.joystick.y = -Math.sin(angle) * force; // Invert Y
            }
        });

        this.joystickManager.on('end', () => {
            this.joystick.x = 0;
            this.joystick.y = 0;
        });

        console.log('🕹️ Virtual joystick initialized');
    },

    updateJoystickVisibility() {
        const joystickZone = document.getElementById('joystick-zone');
        if (joystickZone) {
            joystickZone.style.display = (this.controlMode === 'tap') ? 'none' : 'block';
        }
    },

    handleTapToMove(e) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        let touchX, touchY;

        if (e.touches && e.touches[0]) {
            touchX = e.touches[0].clientX - rect.left;
            touchY = e.touches[0].clientY - rect.top;
        } else {
            touchX = e.clientX - rect.left;
            touchY = e.clientY - rect.top;
        }

        // Convert screen space to world space
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const worldX = touchX * scaleX + (Game.camera?.x || 0);
        const worldY = touchY * scaleY + (Game.camera?.y || 0);

        this.touch.x = worldX;
        this.touch.y = worldY;
        this.touch.active = true;

        // Clear touch after a short delay
        setTimeout(() => {
            this.touch.active = false;
        }, 100);
    },

    // Check if key is currently pressed
    isKeyDown(key) {
        return this.keys[key.toLowerCase()] === true;
    },

    // Get movement input as direction vector
    getMovementInput() {
        let x = 0;
        let y = 0;

        // Keyboard input (desktop)
        if (this.isKeyDown('arrowleft') || this.isKeyDown('a')) x -= 1;
        if (this.isKeyDown('arrowright') || this.isKeyDown('d')) x += 1;
        if (this.isKeyDown('arrowup') || this.isKeyDown('w')) y -= 1;
        if (this.isKeyDown('arrowdown') || this.isKeyDown('s')) y += 1;

        // Virtual joystick input (mobile)
        if (this.isMobile && this.controlMode !== 'tap') {
            x += this.joystick.x;
            y += this.joystick.y;
        }

        // Tap-to-move (mobile)
        if (this.isMobile && (this.controlMode === 'tap' || this.controlMode === 'both')) {
            if (this.touch.active && Player) {
                const dx = this.touch.x - Player.x;
                const dy = this.touch.y - Player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 10) { // Dead zone
                    x += dx / dist;
                    y += dy / dist;
                }
            }
        }

        // Normalize diagonal movement
        const len = Math.sqrt(x * x + y * y);
        if (len > 1) {
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
