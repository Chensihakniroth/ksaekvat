const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'daily',
    aliases: ['d'],
    description: 'Claim your daily cowoncy reward',
    usage: 'daily',
    cooldown: 0,
    category: 'economy',
    
    async execute(message, args) {
        const user = database.getUser(message.author.id);
        const now = new Date();
        const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
        
        // Check if user has already claimed today
        if (lastDaily && now.toDateString() === lastDaily.toDateString()) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const timeUntilReset = Math.ceil((tomorrow - now) / (1000 * 60 * 60));
            
            const embed = helpers.createErrorEmbed(
                `You have already claimed your daily reward today!\n` +
                `Come back in **${timeUntilReset} hours** for your next daily reward.`
            );
            
            return message.reply({ embeds: [embed] });
        }
        
        // Calculate daily amount (base + bonus)
        const baseAmount = config.economy.dailyAmount;
        const levelBonus = user.level * 50;
        const streakBonus = this.calculateStreakBonus(user, lastDaily);
        const totalAmount = baseAmount + levelBonus + streakBonus;
        
        // Update user data
        user.cowoncy += totalAmount;
        user.lastDaily = now.toISOString();
        user.dailyStreak = streakBonus > 0 ? (user.dailyStreak || 0) + 1 : 1;
        
        // Add XP for daily claim
        const xpResult = helpers.addXP(user, 25);
        
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.cowoncy} Daily Reward Claimed!`)
            .setColor(config.colors.success)
            .setDescription(
                `**+${helpers.formatNumber(totalAmount)}** cowoncy earned!\n\n` +
                `**Breakdown:**\n` +
                `• Base reward: ${helpers.formatNumber(baseAmount)}\n` +
                `• Level bonus (${user.level}): +${helpers.formatNumber(levelBonus)}\n` +
                `• Streak bonus (${user.dailyStreak || 1}): +${helpers.formatNumber(streakBonus)}\n\n` +
                `**Current Balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .setFooter({ text: `Come back tomorrow for more rewards!` })
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
    
    calculateStreakBonus(user, lastDaily) {
        if (!lastDaily) return 0;
        
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if last daily was yesterday (consecutive day)
        if (lastDaily.toDateString() === yesterday.toDateString()) {
            const currentStreak = user.dailyStreak || 1;
            return Math.min(currentStreak * 100, 1000); // Max 1000 bonus
        }
        
        return 0; // Streak broken
    }
};
