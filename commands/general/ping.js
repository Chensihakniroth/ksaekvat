const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'ping',
    aliases: ['latency'],
    description: 'Check the bot\'s latency',
    usage: 'ping',
    cooldown: 5000,
    category: 'general',
    
    async execute(message, args) {
        const sent = await message.reply('🏓 Pinging...');
        
        const messagePing = sent.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);
        
        // Determine ping quality
        const getPingQuality = (ping) => {
            if (ping < 100) return { text: 'Excellent', emoji: '🟢', color: config.colors.success };
            if (ping < 200) return { text: 'Good', emoji: '🟡', color: config.colors.warning };
            if (ping < 500) return { text: 'Fair', emoji: '🟠', color: '#ff9500' };
            return { text: 'Poor', emoji: '🔴', color: config.colors.error };
        };
        
        const messageQuality = getPingQuality(messagePing);
        const apiQuality = getPingQuality(apiPing);
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setColor(config.colors.info)
            .addFields(
                {
                    name: `${messageQuality.emoji} Message Latency`,
                    value: `**${messagePing}ms** (${messageQuality.text})`,
                    inline: true
                },
                {
                    name: `${apiQuality.emoji} API Latency`,
                    value: `**${apiPing}ms** (${apiQuality.text})`,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: messagePing < 200 && apiPing < 200 ? 
                           '✅ All systems operational!' : 
                           '⚠️ Some delays may occur',
                    inline: false
                }
            )
            .setFooter({ text: 'Lower is better!' })
            .setTimestamp();
        
        await sent.edit({ content: null, embeds: [embed] });
    }
};
