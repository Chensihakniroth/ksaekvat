const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'profile',
    aliases: ['p', 'stats'],
    description: 'View your or another user\'s profile',
    usage: 'profile [@user]',
    cooldown: 3000,
    category: 'profile',
    
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const user = database.getUser(target.id);
        
        // Calculate additional stats
        const totalAnimals = Object.values(user.zoo).reduce((sum, count) => sum + count, 0);
        const uniqueSpecies = Object.keys(user.zoo).length;
        const nextLevelXP = helpers.calculateXPForLevel(user.level + 1);
        const currentLevelXP = helpers.calculateXPForLevel(user.level);
        const progressXP = user.xp - currentLevelXP;
        const neededXP = nextLevelXP - currentLevelXP;
        const progressPercent = Math.floor((progressXP / neededXP) * 100);
        
        // Calculate win rate
        const totalBattles = user.battlesWon + user.battlesLost;
        const winRate = totalBattles > 0 ? Math.floor((user.battlesWon / totalBattles) * 100) : 0;
        
        // Create progress bar
        const progressBar = this.createProgressBar(progressPercent);
        
        const embed = new EmbedBuilder()
            .setTitle(`${target.username}'s Profile`)
            .setColor(config.colors.primary)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '💰 Economy',
                    value: `**Balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}\n` +
                           `**Daily Streak:** ${user.dailyStreak || 0} days`,
                    inline: true
                },
                {
                    name: '📊 Level & XP',
                    value: `**Level:** ${user.level}\n` +
                           `**XP:** ${helpers.formatNumber(user.xp)}\n` +
                           `**Progress:** ${progressBar} ${progressPercent}%\n` +
                           `**Next Level:** ${helpers.formatNumber(neededXP - progressXP)} XP`,
                    inline: true
                },
                {
                    name: '🦁 Zoo Stats',
                    value: `**Total Animals:** ${helpers.formatNumber(totalAnimals)}\n` +
                           `**Unique Species:** ${uniqueSpecies}\n` +
                           `**Animals Hunted:** ${helpers.formatNumber(user.animalsHunted)}`,
                    inline: true
                },
                {
                    name: '⚔️ Battle Stats',
                    value: `**Wins:** ${user.battlesWon}\n` +
                           `**Losses:** ${user.battlesLost}\n` +
                           `**Win Rate:** ${winRate}%\n` +
                           `**Team Size:** ${user.team?.length || 0}/6`,
                    inline: true
                }
            )
            .setTimestamp();
        
        // Add marriage status
        if (user.marriedTo) {
            try {
                const spouse = await message.client.users.fetch(user.marriedTo);
                embed.addFields({
                    name: '💕 Relationship',
                    value: `**Married to:** ${spouse.username}`,
                    inline: true
                });
            } catch (error) {
                // Spouse not found, remove marriage
                user.marriedTo = null;
                database.saveUser(user);
            }
        }
        
        // Add account creation date
        embed.addFields({
            name: '📅 Account Info',
            value: `**Discord Joined:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>\n` +
                   `**Bot User Since:** <t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true
        });
        
        // Add rank based on level (this could be expanded with a proper ranking system)
        const rank = this.calculateRank(user.level);
        embed.addFields({
            name: '🏆 Rank',
            value: `**${rank.name}** ${rank.emoji}\n*${rank.description}*`,
            inline: false
        });
        
        return message.reply({ embeds: [embed] });
    },
    
    createProgressBar(percent) {
        const totalBars = 10;
        const filledBars = Math.floor((percent / 100) * totalBars);
        const emptyBars = totalBars - filledBars;
        
        return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
    },
    
    calculateRank(level) {
        if (level >= 100) {
            return {
                name: 'Legendary Master',
                emoji: '👑',
                description: 'The ultimate KK champion!'
            };
        } else if (level >= 75) {
            return {
                name: 'Grand Master',
                emoji: '🥇',
                description: 'Elite among the best!'
            };
        } else if (level >= 50) {
            return {
                name: 'Master Hunter',
                emoji: '🏆',
                description: 'Experienced and skilled!'
            };
        } else if (level >= 25) {
            return {
                name: 'Expert Trainer',
                emoji: '🥈',
                description: 'Getting quite good!'
            };
        } else if (level >= 10) {
            return {
                name: 'Animal Enthusiast',
                emoji: '🥉',
                description: 'Making great progress!'
            };
        } else {
            return {
                name: 'Rookie Hunter',
                emoji: '🌱',
                description: 'Just getting started!'
            };
        }
    }
};
