// ============================================================================
// VISUAL EFFECTS
// Particles, screen shake, damage numbers
// ============================================================================

const Effects = {
    particles: [],
    damageNumbers: [],
    screenShake: { x: 0, y: 0, intensity: 0, duration: 0 },
    
    update(dt) {
        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= dt;
            const shake = this.screenShake.intensity;
            this.screenShake.x = (Math.random() - 0.5) * shake;
            this.screenShake.y = (Math.random() - 0.5) * shake;
            
            if (this.screenShake.duration <= 0) {
                this.screenShake.x = 0;
                this.screenShake.y = 0;
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // Gravity
            p.alpha = p.life / p.maxLife;
        }
        
        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i];
            dn.life -= dt;
            
            if (dn.life <= 0) {
                this.damageNumbers.splice(i, 1);
                continue;
            }
            
            dn.y -= 50 * dt; // Float up
            dn.alpha = dn.life / dn.maxLife;
        }
    },
    
    render(ctx) {
        // Render particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
        
        // Render damage numbers
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (const dn of this.damageNumbers) {
            ctx.globalAlpha = dn.alpha;
            ctx.fillStyle = dn.color;
            ctx.fillText(dn.text, dn.x, dn.y);
        }
        
        ctx.globalAlpha = 1;
    },
    
    screenShakeEffect(intensity = 10, duration = 0.3) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    },
    
    spawnParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 100 + Math.random() * 100;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 0.5,
                maxLife: 0.5,
                alpha: 1
            });
        }
    },
    
    showDamageNumber(x, y, damage, color = '#fff') {
        this.damageNumbers.push({
            x: x,
            y: y - 20,
            text: `-${damage}`,
            color: color,
            life: 1.0,
            maxLife: 1.0,
            alpha: 1
        });
    }
};

