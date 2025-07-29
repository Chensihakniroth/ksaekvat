const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'give',
    aliases: ['g'],
    description: '[ADMIN ONLY] Give money from your balance to another user',
    usage: 'Kgive <@user> <amount>',
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
            const embed = helpers.createErrorEmbed('Please mention a user to give money to!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.id === message.author.id) {
            const embed = helpers.createErrorEmbed('You cannot give money to yourself!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.bot) {
            const embed = helpers.createErrorEmbed('You cannot give money to bots!');
            return message.reply({ embeds: [embed] });
        }
        
        if (isNaN(amount) || amount <= 0) {
            const embed = helpers.createErrorEmbed('Please provide a valid amount to give!');
            return message.reply({ embeds: [embed] });
        }
        
        const admin = database.getUser(message.author.id);
        
        if (admin.cowoncy < amount) {
            const embed = helpers.createErrorEmbed(
                `You don't have enough cowoncy! You need **${helpers.formatNumber(amount)}** ${config.emojis.cowoncy} but only have **${helpers.formatNumber(admin.cowoncy)}** ${config.emojis.cowoncy}`
            );
            return message.reply({ embeds: [embed] });
        }
        
        const receiver = database.getUser(target.id);
        
        // Transfer money
        admin.cowoncy -= amount;
        receiver.cowoncy += amount;
        
        database.saveUser(admin);
        database.saveUser(receiver);
        
        const embed = new EmbedBuilder()
            .setTitle('💰 Admin Money Transfer')
            .setDescription(
                `**${message.author.username}** gave **${helpers.formatNumber(amount)}** ${config.emojis.cowoncy} to **${target.username}**!`
            )
            .setColor(config.colors.success)
            .addFields(
                {
                    name: `${message.author.username}'s Balance`,
                    value: `${helpers.formatNumber(admin.cowoncy)} ${config.emojis.cowoncy}`,
                    inline: true
                },
                {
                    name: `${target.username}'s Balance`,
                    value: `${helpers.formatNumber(receiver.cowoncy)} ${config.emojis.cowoncy}`,
                    inline: true
                }
            )
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};