const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'resetuser',
    aliases: ['reset'],
    description: '[ADMIN ONLY] Reset a user\'s data to default values',
    usage: 'resetuser <@user>',
    cooldown: 1000,
    category: 'admin',
    adminOnly: true,
    
    async execute(message, args) {
        // Check if user is admin
        if (message.author.id !== config.adminId) {
            return; // Silently ignore non-admin users
        }
        
        const target = message.mentions.users.first();
        
        // Validation
        if (!target) {
            const embed = helpers.createErrorEmbed('Please mention a user to reset!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.bot) {
            const embed = helpers.createErrorEmbed('You cannot reset bot data!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.id === config.adminId) {
            const embed = helpers.createErrorEmbed('You cannot reset your own admin account!');
            return message.reply({ embeds: [embed] });
        }
        
        // Get current user data for backup info
        const oldUser = database.getUser(target.id);
        
        // Create new default user data
        const newUserData = database.createDefaultUser(target.id);
        database.saveUser(newUserData);
        
        const embed = new EmbedBuilder()
            .setTitle('🔄 Admin User Reset')
            .setDescription(
                `Successfully reset **${target.username}**'s data to default values!\n\n` +
                `**Previous Data:**\n` +
                `• Balance: ${helpers.formatNumber(oldUser.cowoncy)} ${config.emojis.cowoncy}\n` +
                `• Level: ${oldUser.level} (${helpers.formatNumber(oldUser.xp)} XP)\n` +
                `• Animals: ${Object.keys(oldUser.zoo).length} species\n\n` +
                `**New Data:**\n` +
                `• Balance: ${helpers.formatNumber(newUserData.cowoncy)} ${config.emojis.cowoncy}\n` +
                `• Level: ${newUserData.level} (${helpers.formatNumber(newUserData.xp)} XP)\n` +
                `• Animals: ${Object.keys(newUserData.zoo).length} species`
            )
            .setColor(config.colors.warning)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};