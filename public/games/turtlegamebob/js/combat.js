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
            
            // Visual effects
            Effects.spawnParticles(enemy.x, enemy.y, 8, '#ff416c');
            Effects.showDamageNumber(enemy.x, enemy.y, damage, '#ff416c');
            Effects.screenShakeEffect(5, 0.1);
            
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
        
        // Visual effects
        Effects.spawnParticles(Player.x, Player.y, 6, '#ef4444');
        Effects.showDamageNumber(Player.x, Player.y, actualDamage, '#ef4444');
        Effects.screenShakeEffect(8, 0.2);
        
        // Knockback player
        const angle = angleBetween(enemy, Player);
        Player.x += Math.cos(angle) * 20;
        Player.y += Math.sin(angle) * 20;
    }
};

