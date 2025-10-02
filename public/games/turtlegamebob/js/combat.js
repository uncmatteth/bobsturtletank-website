// ============================================================================
// COMBAT SYSTEM
// Damage calculations, attacks
// ============================================================================

const Combat = {
    playerAttack() {
        const attackRange = 60; // pixels
        
        // Find enemies in range
        const hitEnemies = Enemy.list.filter(enemy => {
            const dist = distance(Player, enemy);
            return dist < attackRange && enemy.health > 0;
        });
        
        // Damage all enemies in range
        for (const enemy of hitEnemies) {
            const damage = Player.damage + (Player.equippedWeapon?.damage || 0);
            Enemy.takeDamage(enemy, damage);
            
            // Knockback
            const angle = angleBetween(Player, enemy);
            enemy.x += Math.cos(angle) * 30;
            enemy.y += Math.sin(angle) * 30;
            
            console.log(`Player dealt ${damage} damage to ${enemy.type}!`);
        }
    },
    
    enemyAttack(enemy) {
        // Check if player in range
        const dist = distance(enemy, Player);
        if (dist > 50) return;
        
        // Calculate damage
        const damage = enemy.damage - Player.defense;
        const actualDamage = Player.takeDamage(damage);
        
        // Knockback player
        const angle = angleBetween(enemy, Player);
        Player.x += Math.cos(angle) * 20;
        Player.y += Math.sin(angle) * 20;
    }
};

