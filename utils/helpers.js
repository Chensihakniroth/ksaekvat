const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');

class Helpers {
    // Create a standard embed
    createEmbed(title, description, color = config.colors.primary) {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
    }
    
    // Create an error embed
    createErrorEmbed(message) {
        return this.createEmbed('❌ Error', message, config.colors.error);
    }
    
    // Create a success embed
    createSuccessEmbed(message) {
        return this.createEmbed('✅ Success', message, config.colors.success);
    }
    
    // Format numbers with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Format time remaining
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (remainingSeconds === 0) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    // Get random element from array
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Get random number between min and max
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Calculate level from XP
    calculateLevel(xp) {
        return Math.floor(0.1 * Math.sqrt(xp)) + 1;
    }
    
    // Calculate XP needed for next level
    calculateXPForLevel(level) {
        return Math.pow((level - 1) / 0.1, 2);
    }
    
    // Add XP to user
    addXP(user, amount) {
        user.xp += amount;
        const newLevel = this.calculateLevel(user.xp);
        
        if (newLevel > user.level) {
            user.level = newLevel;
            return { levelUp: true, newLevel };
        }
        
        return { levelUp: false };
    }
    
    // Get animal by rarity
    getRandomAnimalByRarity(animals) {
        const rand = Math.random();
        let cumulativeChance = 0;
        
        for (const [rarity, data] of Object.entries(config.animalRarities)) {
            cumulativeChance += data.chance;
            if (rand <= cumulativeChance) {
                const animalsByRarity = animals.filter(animal => animal.rarity === rarity);
                return this.getRandomElement(animalsByRarity);
            }
        }
        
        // Fallback to common
        const commonAnimals = animals.filter(animal => animal.rarity === 'common');
        return this.getRandomElement(commonAnimals);
    }
    
    // Calculate cowoncy value of animal
    getAnimalValue(animal) {
        const rarityData = config.animalRarities[animal.rarity] || config.animalRarities.common;
        return Math.floor(animal.baseValue * rarityData.multiplier);
    }
}

module.exports = new Helpers();
