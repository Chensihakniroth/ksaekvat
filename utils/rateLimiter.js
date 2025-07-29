const cooldowns = new Map();

class RateLimiter {
    constructor() {
        // Clean up old cooldowns every 5 minutes
        setInterval(() => {
            const now = Date.now();
            for (const [key, timestamp] of cooldowns.entries()) {
                if (now - timestamp > 300000) { // 5 minutes
                    cooldowns.delete(key);
                }
            }
        }, 300000);
    }
    
    isOnCooldown(userId, commandName, cooldownTime) {
        const key = `${userId}-${commandName}`;
        const lastUsed = cooldowns.get(key);
        
        if (!lastUsed) {
            return false;
        }
        
        const timePassed = Date.now() - lastUsed;
        return timePassed < cooldownTime;
    }
    
    setCooldown(userId, commandName) {
        const key = `${userId}-${commandName}`;
        cooldowns.set(key, Date.now());
    }
    
    getRemainingCooldown(userId, commandName, cooldownTime) {
        const key = `${userId}-${commandName}`;
        const lastUsed = cooldowns.get(key);
        
        if (!lastUsed) {
            return 0;
        }
        
        const timePassed = Date.now() - lastUsed;
        const remaining = cooldownTime - timePassed;
        
        return Math.max(0, Math.ceil(remaining / 1000));
    }
}

module.exports = new RateLimiter();
