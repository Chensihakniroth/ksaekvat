const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'setbalance',
    aliases: ['setbal', 'sb'],
    description: '[ADMIN ONLY] Set a user\'s balance to a specific amount',
    usage: 'setbalance <@user> <amount>',
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
            const embed = helpers.createErrorEmbed('Please mention a user to set balance for!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.bot) {
            const embed = helpers.createErrorEmbed('You cannot set balance for bots!');
            return message.reply({ embeds: [embed] });
        }
        
        if (isNaN(amount) || amount < 0) {
            const embed = helpers.createErrorEmbed('Please provide a valid balance amount (0 or higher)!');
            return message.reply({ embeds: [embed] });
        }
        
        if (amount > 1000000000) {
            const embed = helpers.createErrorEmbed('Maximum balance is 1 billion!');
            return message.reply({ embeds: [embed] });
        }
        
        const user = database.getUser(target.id);
        const oldBalance = user.cowoncy;
        
        user.cowoncy = amount;
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle('💰 Admin Balance Set')
            .setDescription(
                `Set **${target.username}**'s balance to **${helpers.formatNumber(amount)}** ${config.emojis.cowoncy}!\n\n` +
                `**Previous Balance:** ${helpers.formatNumber(oldBalance)} ${config.emojis.cowoncy}\n` +
                `**New Balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .setColor(config.colors.success)
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};