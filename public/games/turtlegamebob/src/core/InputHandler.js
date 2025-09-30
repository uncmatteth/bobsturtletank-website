// Input handling - keyboard and mouse
export class InputHandler {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        this.keys = this.scene.input.keyboard.addKeys('I,E,R,SPACE');
        
        this.scene.input.on('pointerdown', (pointer) => {
            const tileX = Math.floor(pointer.worldX / 48);
            const tileY = Math.floor(pointer.worldY / 48);
            this.scene.playerController.moveToTarget(tileX, tileY);
        });
    }

    update() {
        if (!this.scene.gameState?.player) return;
        
        let moveX = 0, moveY = 0;
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) moveX = -1;
        if (this.cursors.right.isDown || this.wasd.D.isDown) moveX = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) moveY = -1;
        if (this.cursors.down.isDown || this.wasd.S.isDown) moveY = 1;
        
        if (moveX !== 0 || moveY !== 0) {
            this.scene.playerController.move(moveX, moveY);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
            this.scene.uiManager.toggleInventory();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.scene.playerController.identifyItem();
        }
    }
}
