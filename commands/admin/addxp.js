const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'addxp',
    aliases: ['axp'],
    description: '[ADMIN ONLY] Add XP to a user',
    usage: 'addxp <@user> <amount>',
    cooldown: 1000,
    category: 'admin',
    adminOnly: true,
    
    async execute(message, args) {
        // Check if user is admin
        if (message.author.id !== config.adminId) {
            return; // Silently ignore non-admin users
        }
        
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);
        
        // Validation
        if (!target) {
            const embed = helpers.createErrorEmbed('Please mention a user to give XP to!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.bot) {
            const embed = helpers.createErrorEmbed('You cannot give XP to bots!');
            return message.reply({ embeds: [embed] });
        }
        
        if (isNaN(amount) || amount <= 0) {
            const embed = helpers.createErrorEmbed('Please provide a valid XP amount!');
            return message.reply({ embeds: [embed] });
        }
        
        if (amount > 100000) {
            const embed = helpers.createErrorEmbed('Maximum XP amount is 100,000!');
            return message.reply({ embeds: [embed] });
        }
        
        const user = database.getUser(target.id);
        const oldLevel = user.level;
        const oldXP = user.xp;
        
        // Add XP and check for level ups
        const xpResult = helpers.addXP(user, amount);
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle('⭐ Admin XP Grant')
            .setDescription(
                `Added **${helpers.formatNumber(amount)}** XP to **${target.username}**!\n\n` +
                `**Previous:** Level ${oldLevel} (${helpers.formatNumber(oldXP)} XP)\n` +
                `**New:** Level ${user.level} (${helpers.formatNumber(user.xp)} XP)`
            )
            .setColor(config.colors.success)
            .setTimestamp();
        
        if (xpResult.levelUp) {
            embed.addFields({
                name: '🎉 Level Up!',
                value: `${target.username} leveled up from **${oldLevel}** to **${user.level}**!`,
                inline: false
            });
        }
        
        return message.reply({ embeds: [embed] });
    }
};