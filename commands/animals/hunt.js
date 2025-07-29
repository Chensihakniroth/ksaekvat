const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const rateLimiter = require('../../utils/rateLimiter.js');
const config = require('../../config/config.js');
const animals = require('../../data/animals.json');

module.exports = {
    name: 'hunt',
    aliases: ['h', 'catch'],
    description: 'Hunt for animals to add to your zoo!',
    usage: 'hunt',
    cooldown: config.economy.huntCooldown,
    category: 'animals',
    
    async execute(message, args) {
        const userId = message.author.id;
        
        // Check cooldown
        if (rateLimiter.isOnCooldown(userId, 'hunt', this.cooldown)) {
            const remaining = rateLimiter.getRemainingCooldown(userId, 'hunt', this.cooldown);
            const embed = helpers.createErrorEmbed(
                `You need to wait **${helpers.formatTime(remaining)}** before hunting again!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        const user = database.getUser(userId);
        
        // Random chance to find nothing
        if (Math.random() < 0.15) {
            rateLimiter.setCooldown(userId, 'hunt', this.cooldown);
            
            const failMessages = [
                'You spent forever looking for animals but found nothing! 🌿',
                'You searched high and low but came back empty-handed! 🔍',
                'The animals were too quick for you this time! 💨',
                'You got distracted by a pretty butterfly and forgot to hunt! 🦋',
                'You made too much noise and scared all the animals away! 😅'
            ];
            
            const embed = new EmbedBuilder()
                .setTitle('🎯 Hunt Results')
                .setDescription(helpers.getRandomElement(failMessages))
                .setColor(config.colors.warning)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        // Get random animal
        const animal = helpers.getRandomAnimalByRarity(animals);
        const animalCount = user.zoo[animal.name] || 0;
        
        // Add animal to user's zoo
        user.zoo[animal.name] = animalCount + 1;
        user.animalsHunted++;
        
        // Add XP and cowoncy
        const xpGain = Math.floor(Math.random() * 10) + 5;
        const cowoncyGain = Math.floor(Math.random() * 50) + 25;
        
        const xpResult = helpers.addXP(user, xpGain);
        user.cowoncy += cowoncyGain;
        
        rateLimiter.setCooldown(userId, 'hunt', this.cooldown);
        database.saveUser(user);
        
        // Create result embed
        const embed = new EmbedBuilder()
            .setTitle('🎯 Hunt Successful!')
            .setDescription(
                `You caught a **${animal.rarity}** ${animal.emoji} **${animal.name}**!\n\n` +
                `**Rewards:**\n` +
                `• +${cowoncyGain} ${config.emojis.cowoncy} cowoncy\n` +
                `• +${xpGain} XP\n\n` +
                `You now have **${user.zoo[animal.name]}** ${animal.name}${user.zoo[animal.name] > 1 ? 's' : ''} in your zoo!`
            )
            .setColor(this.getRarityColor(animal.rarity))
            .addFields(
                {
                    name: 'Animal Info',
                    value: `**Rarity:** ${animal.rarity}\n**Habitat:** ${animal.habitat}`,
                    inline: true
                },
                {
                    name: 'Your Stats',
                    value: `**Balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}\n**Animals Hunted:** ${user.animalsHunted}`,
                    inline: true
                }
            )
            .setThumbnail(`https://via.placeholder.com/100x100/36393f/ffffff?text=${animal.emoji}`)
            .setFooter({ text: `Next hunt available in ${helpers.formatTime(this.cooldown / 1000)}` })
            .setTimestamp();
        
        if (xpResult.levelUp) {
            embed.addFields({
                name: '🎉 Level Up!',
                value: `You reached level **${xpResult.newLevel}**!`,
                inline: false
            });
        }
        
        return message.reply({ embeds: [embed] });
    },
    
    getRarityColor(rarity) {
        const colors = {
            common: '#95a5a6',
            uncommon: '#2ecc71',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f1c40f'
        };
        return colors[rarity] || colors.common;
    }
};
