const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'adminhelp',
    aliases: ['ahelp', 'ah'],
    description: '[ADMIN ONLY] Show admin commands',
    usage: 'adminhelp',
    cooldown: 5000,
    category: 'admin',
    adminOnly: true,
    
    async execute(message, args) {
        // Check if user is admin
        if (message.author.id !== config.adminId) {
            return; // Silently ignore non-admin users
        }
        
        const embed = new EmbedBuilder()
            .setTitle('👑 Admin Commands')
            .setDescription('Exclusive commands for the bot administrator')
            .setColor(config.colors.primary)
            .addFields(
                {
                    name: '💰 Economy Commands',
                    value: '• `Kgive @user amount` - Give money from your balance\n' +
                           '• `addmoney amount` - Add money to your account\n' +
                           '• `setbalance @user amount` - Set user\'s balance\n',
                    inline: false
                },
                {
                    name: '⭐ XP Commands',
                    value: '• `addxp @user amount` - Give XP to a user\n',
                    inline: false
                },
                {
                    name: '🔧 Utility Commands',
                    value: '• `resetuser @user` - Reset user data to defaults\n' +
                           '• `adminhelp` - Show this help menu\n',
                    inline: false
                }
            )
            .setFooter({ text: 'Admin ID: ' + config.adminId })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};