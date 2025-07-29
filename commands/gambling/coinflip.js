const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const rateLimiter = require('../../utils/rateLimiter.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'coinflip',
    aliases: ['cf', 'kcf'],
    description: 'Flip a coin and bet on heads or tails! Use "kcf all h/t" to bet everything!',
    usage: 'coinflip <heads/tails> <bet> | kcf all <h/t>',
    cooldown: 3000,
    category: 'gambling',

    async execute(message, args, client, commandName) {
        const userId = message.author.id;
        const user = database.getUser(userId);

        // Handle special "kcf" syntax: kcf all h/t OR any command with "all" as first arg
        if ((commandName === 'kcf' || args[0]?.toLowerCase() === 'all') && args.length >= 2) {
            const betAmount = args[0]?.toLowerCase();
            const choice = args[1]?.toLowerCase();

            if (betAmount === 'all') {
                if (!choice || !['h', 't', 'H', 'T', 'heads', 'tails'].includes(choice)) {
                    const embed = helpers.createErrorEmbed(
                        'Please specify heads or tails!\n\n' +
                        '**Special KCF Examples:**\n' +
                        '• `kcf all h` - Bet all on heads\n' +
                        '• `kcf all t` - Bet all on tails'
                    );
                    return message.reply({ embeds: [embed] });
                }

                if (user.cowoncy < config.economy.minBet) {
                    const embed = helpers.createErrorEmbed(
                        `You need at least **${config.economy.minBet}** ${config.emojis.cowoncy} to bet "all"!`
                    );
                    return message.reply({ embeds: [embed] });
                }

                // Use all cowoncy as bet (capped at 250k for all-in)
                const allInBet = Math.min(user.cowoncy, config.allBetCap);
                return this.performCoinflip(message, choice, allInBet, userId, user, true);
            }
        }

        // Regular coinflip syntax
        const choice = args[0]?.toLowerCase();
        const bet = parseInt(args[1]);

        // Validation
        if (!choice || !['heads', 'tails', 'h', 't', 'H', 'T'].includes(choice)) {
            const embed = helpers.createErrorEmbed(
                'Please specify heads or tails!\n\n' +
                '**Examples:**\n' +
                '• `coinflip heads 100`\n' +
                '• `cf tails 500`\n' +
                '• `flip h 250`\n' +
                '• `kcf all h` - Bet all on heads\n' +
                '• `kcf all t` - Bet all on tails'
            );
            return message.reply({ embeds: [embed] });
        }

        if (isNaN(bet) || bet <= 0) {
            const embed = helpers.createErrorEmbed('Please provide a valid bet amount!');
            return message.reply({ embeds: [embed] });
        }

        if (bet < config.economy.minBet) {
            const embed = helpers.createErrorEmbed(
                `Minimum bet is **${config.economy.minBet}** ${config.emojis.cowoncy}!`
            );
            return message.reply({ embeds: [embed] });
        }

        if (bet > config.economy.maxBet) {
            const embed = helpers.createErrorEmbed(
                `Maximum bet is **${helpers.formatNumber(config.economy.maxBet)}** ${config.emojis.cowoncy}!`
            );
            return message.reply({ embeds: [embed] });
        }

        return this.performCoinflip(message, choice, bet, userId, user, false);
    },

    async performCoinflip(message, choice, bet, userId, currentUser, isAllIn) {
        // Check cooldown
        if (rateLimiter.isOnCooldown(userId, 'coinflip', this.cooldown)) {
            const remaining = rateLimiter.getRemainingCooldown(userId, 'coinflip', this.cooldown);
            const embed = helpers.createErrorEmbed(
                `You need to wait **${helpers.formatTime(remaining)}** before flipping again!`
            );
            return message.reply({ embeds: [embed] });
        }

        if (currentUser.cowoncy < bet) {
            const embed = helpers.createErrorEmbed(
                `You don't have enough cowoncy! You need **${helpers.formatNumber(bet)}** ${config.emojis.cowoncy} but only have **${helpers.formatNumber(currentUser.cowoncy)}** ${config.emojis.cowoncy}`
            );
            return message.reply({ embeds: [embed] });
        }

        rateLimiter.setCooldown(userId, 'coinflip', this.cooldown);

        // Normalize choice
        const normalizedChoice = choice.toLowerCase();
        const playerChoice = normalizedChoice === 'h' ? 'heads' : normalizedChoice === 't' ? 'tails' : normalizedChoice;

        // Create initial embed
        const flipEmbed = new EmbedBuilder()
            .setTitle('🪙 **KK COINFLIP** 🪙')
            .setDescription(
                `💰 **BET:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}${isAllIn ? ' (ALL IN!)' : ''}\n\n` +
                `🎯 **Your Choice:** ${playerChoice === 'heads' ? '👨' : '👑'} ${playerChoice.toUpperCase()}\n\n` +
                `🎲 **Flipping coin...**`
            )
            .setColor('#FFD700')
            .setTimestamp();

        const coinMessage = await message.reply({ embeds: [flipEmbed] });

        // Flip animation
        const flipFrames = ['🌀', '🪙', '💫', '🪙', '✨', '🪙'];
        for (let i = 0; i < flipFrames.length; i++) {
            const animEmbed = new EmbedBuilder()
                .setTitle('🪙 **KK COINFLIP** 🪙')
                .setDescription(
                    `💰 **BET:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}${isAllIn ? ' (ALL IN!)' : ''}\n\n` +
                    `🎯 **Your Choice:** ${playerChoice === 'heads' ? '👨' : '👑'} ${playerChoice.toUpperCase()}\n\n` +
                    `${flipFrames[i]} **FLIPPING...**`
                )
                .setColor('#FFD700')
                .setTimestamp();

            await coinMessage.edit({ embeds: [animEmbed] });
            await this.sleep(150);
        }

        // Flip the coin
        const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
        const won = playerChoice === coinResult;

        // Calculate winnings
        const winnings = won ? bet * 2 : 0;
        const profit = winnings - bet;

        // Update user balance
        currentUser.cowoncy -= bet;
        currentUser.cowoncy += winnings;

        // Add XP
        const xpGain = Math.floor(bet / 100) + 10;
        const xpResult = helpers.addXP(currentUser, xpGain);

        database.saveUser(currentUser);

        // Create result embed
        const resultEmbed = new EmbedBuilder()
            .setTitle(`🪙 **KK COINFLIP RESULTS** 🪙`)
            .setDescription(
                `🎯 **Your Choice:** ${playerChoice === 'heads' ? '👨' : '👑'} ${playerChoice.toUpperCase()}\n` +
                `🪙 **Result:** ${coinResult === 'heads' ? '👨' : '👑'} ${coinResult.toUpperCase()}\n\n` +
                `💰 **Bet:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}${isAllIn ? ' (ALL IN!)' : ''}\n` +
                (won 
                    ? `🎉 **YOU WON!**\n💸 **Profit:** +${helpers.formatNumber(profit)} ${config.emojis.cowoncy}\n` +
                      `💰 **Total received:** ${helpers.formatNumber(winnings)} ${config.emojis.cowoncy}`
                    : `💔 **YOU LOST!**\n💸 **Lost:** -${helpers.formatNumber(bet)} ${config.emojis.cowoncy}`
                ) +
                `\n\n💳 **New Balance:** ${helpers.formatNumber(currentUser.cowoncy)} ${config.emojis.cowoncy}`
            )
            .setColor(won ? '#00FF00' : '#FF4444')
            .setFooter({ 
                text: won 
                    ? isAllIn 
                        ? '🎊 AMAZING! You doubled your entire balance!' 
                        : '🎉 Nice win! Try again for more!'
                    : isAllIn 
                        ? '💪 All or nothing! Claim your daily and try again!' 
                        : '🔄 Better luck next time!'
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
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};