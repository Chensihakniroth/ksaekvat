const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const rateLimiter = require('../../utils/rateLimiter.js');
const config = require('../../config/config.js');
const animals = require('../../data/animals.json');

module.exports = {
    name: 'battle',
    aliases: ['fight', 'duel'],
    description: 'Battle another user with your animals!',
    usage: 'battle <@user> [bet]',
    cooldown: config.economy.battleCooldown,
    category: 'battle',
    
    async execute(message, args) {
        const target = message.mentions.users.first();
        const bet = parseInt(args[1]) || 0;
        const userId = message.author.id;
        
        // Validation
        if (!target) {
            const embed = helpers.createErrorEmbed('Please mention a user to battle!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.id === userId) {
            const embed = helpers.createErrorEmbed('You cannot battle yourself!');
            return message.reply({ embeds: [embed] });
        }
        
        if (target.bot) {
            const embed = helpers.createErrorEmbed('You cannot battle bots!');
            return message.reply({ embeds: [embed] });
        }
        
        // Check cooldown
        if (rateLimiter.isOnCooldown(userId, 'battle', this.cooldown)) {
            const remaining = rateLimiter.getRemainingCooldown(userId, 'battle', this.cooldown);
            const embed = helpers.createErrorEmbed(
                `You need to wait **${helpers.formatTime(remaining)}** before battling again!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        const challenger = database.getUser(userId);
        const defender = database.getUser(target.id);
        
        // Check if users have animals
        if (Object.keys(challenger.zoo).length === 0) {
            const embed = helpers.createErrorEmbed('You need animals to battle! Use `kk hunt` first!');
            return message.reply({ embeds: [embed] });
        }
        
        if (Object.keys(defender.zoo).length === 0) {
            const embed = helpers.createErrorEmbed(`${target.username} doesn't have any animals to battle with!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Check bet amounts
        if (bet > 0) {
            if (bet < config.economy.minBet) {
                const embed = helpers.createErrorEmbed(`Minimum bet is ${config.economy.minBet} ${config.emojis.cowoncy}!`);
                return message.reply({ embeds: [embed] });
            }
            
            if (bet > config.economy.maxBet) {
                const embed = helpers.createErrorEmbed(`Maximum bet is ${helpers.formatNumber(config.economy.maxBet)} ${config.emojis.cowoncy}!`);
                return message.reply({ embeds: [embed] });
            }
            
            if (challenger.cowoncy < bet) {
                const embed = helpers.createErrorEmbed(`You don't have enough cowoncy to bet ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}!`);
                return message.reply({ embeds: [embed] });
            }
            
            if (defender.cowoncy < bet) {
                const embed = helpers.createErrorEmbed(`${target.username} doesn't have enough cowoncy for this bet!`);
                return message.reply({ embeds: [embed] });
            }
        }
        
        // Create battle invitation
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Battle Challenge!')
            .setDescription(
                `**${message.author.username}** challenges **${target.username}** to a battle!\n\n` +
                (bet > 0 ? `**Bet:** ${helpers.formatNumber(bet)} ${config.emojis.cowoncy}\n\n` : '') +
                `${target.username}, do you accept this challenge?`
            )
            .setColor(config.colors.warning)
            .setThumbnail('https://via.placeholder.com/100x100/36393f/ffffff?text=⚔️')
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept Battle')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );
        
        const response = await message.reply({ embeds: [embed], components: [row] });
        
        // Button collector for 30 seconds
        const collector = response.createMessageComponentCollector({ time: 30000 });
        
        collector.on('collect', async interaction => {
            if (interaction.user.id !== target.id) {
                return interaction.reply({ 
                    content: 'Only the challenged user can respond to this battle!', 
                    ephemeral: true 
                });
            }
            
            if (interaction.customId === 'decline') {
                const declineEmbed = helpers.createErrorEmbed(
                    `${target.username} declined the battle challenge!`
                );
                await interaction.update({ embeds: [declineEmbed], components: [] });
                return;
            }
            
            if (interaction.customId === 'accept') {
                // Start the battle
                await this.startBattle(interaction, challenger, defender, bet, message.author, target);
            }
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                const timeoutEmbed = helpers.createErrorEmbed(
                    'Battle challenge timed out! No response received.'
                );
                response.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    },
    
    async startBattle(interaction, challenger, defender, bet, challengerUser, defenderUser) {
        // Set cooldown for challenger
        rateLimiter.setCooldown(challenger.id, 'battle', this.cooldown);
        
        // Get random animals for battle
        const challengerAnimal = this.getRandomAnimal(challenger.zoo);
        const defenderAnimal = this.getRandomAnimal(defender.zoo);
        
        // Calculate battle power
        const challengerPower = this.calculateBattlePower(challengerAnimal);
        const defenderPower = this.calculateBattlePower(defenderAnimal);
        
        // Add some randomness (±25%)
        const challengerFinalPower = challengerPower * (0.75 + Math.random() * 0.5);
        const defenderFinalPower = defenderPower * (0.75 + Math.random() * 0.5);
        
        const challengerWins = challengerFinalPower > defenderFinalPower;
        const winner = challengerWins ? challenger : defender;
        const loser = challengerWins ? defender : challenger;
        const winnerUser = challengerWins ? challengerUser : defenderUser;
        const loserUser = challengerWins ? defenderUser : challengerUser;
        const winnerAnimal = challengerWins ? challengerAnimal : defenderAnimal;
        const loserAnimal = challengerWins ? defenderAnimal : challengerAnimal;
        
        // Update stats
        winner.battlesWon++;
        loser.battlesLost++;
        
        // Handle bet
        if (bet > 0) {
            winner.cowoncy += bet;
            loser.cowoncy -= bet;
        }
        
        // Add XP
        helpers.addXP(winner, 50);
        helpers.addXP(loser, 25);
        
        database.saveUser(challenger);
        database.saveUser(defender);
        
        // Create battle result embed
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Battle Results!')
            .setDescription(
                `**${winnerUser.username}** wins the battle!\n\n` +
                `**${challengerUser.username}'s** ${challengerAnimal.data.emoji} **${challengerAnimal.data.name}** ` +
                `(Power: ${Math.floor(challengerFinalPower)})\n` +
                `**VS**\n` +
                `**${defenderUser.username}'s** ${defenderAnimal.data.emoji} **${defenderAnimal.data.name}** ` +
                `(Power: ${Math.floor(defenderFinalPower)})\n\n` +
                (bet > 0 ? `**${winnerUser.username}** wins **${helpers.formatNumber(bet)}** ${config.emojis.cowoncy}!\n\n` : '') +
                `**Battle Stats:**\n` +
                `${winnerUser.username}: ${winner.battlesWon}W - ${winner.battlesLost}L\n` +
                `${loserUser.username}: ${loser.battlesWon}W - ${loser.battlesLost}L`
            )
            .setColor(challengerWins ? config.colors.success : config.colors.error)
            .addFields(
                {
                    name: 'Winner',
                    value: `${winnerAnimal.data.emoji} **${winnerAnimal.data.name}**\n` +
                           `Rarity: ${winnerAnimal.data.rarity}\n` +
                           `Final Power: ${Math.floor(challengerWins ? challengerFinalPower : defenderFinalPower)}`,
                    inline: true
                },
                {
                    name: 'Loser',
                    value: `${loserAnimal.data.emoji} **${loserAnimal.data.name}**\n` +
                           `Rarity: ${loserAnimal.data.rarity}\n` +
                           `Final Power: ${Math.floor(challengerWins ? defenderFinalPower : challengerFinalPower)}`,
                    inline: true
                }
            )
            .setFooter({ text: 'Good battle! Try again to improve your skills!' })
            .setTimestamp();
        
        await interaction.update({ embeds: [embed], components: [] });
    },
    
    getRandomAnimal(zoo) {
        const animalNames = Object.keys(zoo).filter(name => zoo[name] > 0);
        const randomAnimalName = helpers.getRandomElement(animalNames);
        const animalData = animals.find(a => a.name === randomAnimalName);
        
        return {
            name: randomAnimalName,
            data: animalData
        };
    },
    
    calculateBattlePower(animal) {
        const rarityMultipliers = {
            common: 1,
            uncommon: 1.5,
            rare: 2.5,
            epic: 4,
            legendary: 7
        };
        
        const basePower = 100;
        const rarityMultiplier = rarityMultipliers[animal.data.rarity] || 1;
        
        return basePower * rarityMultiplier;
    }
};
