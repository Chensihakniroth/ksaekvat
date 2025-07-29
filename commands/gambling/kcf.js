const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const rateLimiter = require('../../utils/rateLimiter.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'kcf',
    aliases: ['quickflip', 'qf'],
    description: 'Quick all-in coinflip! Bet your entire balance instantly',
    usage: 'kcf',
    cooldown: 3000,
    category: 'gambling',
    
    async execute(message, args) {
        const userId = message.author.id;
        
        if (rateLimiter.isOnCooldown(userId, 'kcf', this.cooldown)) {
            const remaining = rateLimiter.getRemainingCooldown(userId, 'kcf', this.cooldown);
            const embed = helpers.createErrorEmbed(
                `You need to wait **${helpers.formatTime(remaining)}** before using quick coinflip again!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        const user = database.getUser(userId);
        const bet = user.cowoncy; // All-in bet
        
        if (bet < config.economy.minBet) {
            const embed = helpers.createErrorEmbed(
                `You need at least **${config.economy.minBet}** ${config.emojis.cowoncy} to play quick coinflip!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        rateLimiter.setCooldown(userId, 'kcf', this.cooldown);
        
        // Quick animation
        const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        const playerChoice = Math.random() < 0.5 ? 'heads' : 'tails'; // Random choice for user
        const won = flipResult === playerChoice;
        
        const flipEmbed = new EmbedBuilder()
            .setTitle('🪙 **KK QUICK COINFLIP** 🪙')
            .setDescription(
                `💰 **ALL-IN BET:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}\n\n🎲 **Flipping coin...**`
            )
            .setColor('#FFD700')
            .setTimestamp();
        
        const coinMessage = await message.reply({ embeds: [flipEmbed] });
        
        // Quick flip animation
        const flipFrames = ['🌀', '🪙', '💫', '🪙', '✨', '🪙'];
        for (let i = 0; i < flipFrames.length; i++) {
            const animEmbed = new EmbedBuilder()
                .setTitle('🪙 **KK QUICK COINFLIP** 🪙')
                .setDescription(
                    `💰 **ALL-IN BET:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}\n\n${flipFrames[i]} **FLIPPING...**`
                )
                .setColor('#FFD700')
                .setTimestamp();
            
            await coinMessage.edit({ embeds: [animEmbed] });
            await this.sleep(150);
        }
        
        // Update user balance
        if (won) {
            user.cowoncy += bet; // Double their money
        } else {
            user.cowoncy = 0; // Lose everything
        }
        
        const xpGain = Math.floor(bet / 100) + 10; // More XP for all-in
        const xpResult = helpers.addXP(user, xpGain);
        database.saveUser(user);
        
        const resultEmbed = new EmbedBuilder()
            .setTitle(`🪙 **KK QUICK COINFLIP RESULTS** 🪙`)
            .setDescription(
                `🎯 **Your Choice:** ${playerChoice === 'heads' ? '👨' : '👑'} ${playerChoice.toUpperCase()}\n` +
                `🪙 **Result:** ${flipResult === 'heads' ? '👨' : '👑'} ${flipResult.toUpperCase()}\n\n` +
                `💰 **All-in Bet:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}\n` +
                (won 
                    ? `🎉 **DOUBLED YOUR MONEY!**\n💸 **Won:** +${helpers.formatNumber(bet)} ${config.emojis.cowoncy}`
                    : `💔 **LOST EVERYTHING!**\n💸 **Lost:** -${helpers.formatNumber(bet)} ${config.emojis.cowoncy}`) +
                `\n\n💳 **New Balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .setColor(won ? '#00FF00' : '#FF4444')
            .setFooter({ 
                text: won ? '🎊 AMAZING! You doubled your entire balance!' : '💪 All or nothing! Claim your daily and try again!'
            })
            .setTimestamp();
        
        if (xpResult.levelUp) {
            resultEmbed.addFields({
                name: '🎉 Level Up!',
                value: `You reached level **${xpResult.newLevel}**!`,
                inline: false
            });
        }
        
        await coinMessage.edit({ embeds: [resultEmbed] });
        
        // Reactions
        if (won) {
            await coinMessage.react('🎉');
            await coinMessage.react('💰');
            await coinMessage.react('🔥');
        } else {
            await coinMessage.react('💪');
            await coinMessage.react('🎯');
        }
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};