const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money', 'cowoncy'],
    description: 'Check your cowoncy balance',
    usage: 'balance [@user]',
    cooldown: 2000,
    category: 'economy',
    
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const user = database.getUser(target.id);
        
        const embed = new EmbedBuilder()
            .setTitle(`${config.emojis.cowoncy} ${target.username}'s Balance`)
            .setColor(config.colors.primary)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 128 }))
            .addFields(
                {
                    name: 'Cowoncy',
                    value: `${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`,
                    inline: true
                },
                {
                    name: 'Level',
                    value: `${user.level}`,
                    inline: true
                },
                {
                    name: 'XP',
                    value: `${helpers.formatNumber(user.xp)}`,
                    inline: true
                }
            )
            .setTimestamp();
        
        // Add daily streak if exists
        if (user.dailyStreak && user.dailyStreak > 1) {
            embed.addFields({
                name: 'Daily Streak',
                value: `${user.dailyStreak} days 🔥`,
                inline: true
            });
        }
        
        // Add marriage status
        if (user.marriedTo) {
            try {
                const spouse = await message.client.users.fetch(user.marriedTo);
                embed.addFields({
                    name: 'Married to',
                    value: `${spouse.username} 💕`,
                    inline: true
                });
            } catch (error) {
                // Spouse not found, remove marriage
                user.marriedTo = null;
                database.saveUser(user);
            }
        }
        
        return message.reply({ embeds: [embed] });
    }
};
