const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');
const animals = require('../../data/animals.json');

module.exports = {
    name: 'team',
    aliases: ['squad'],
    description: 'Manage your battle team',
    usage: 'team [add/remove/view] [animal]',
    cooldown: 3000,
    category: 'battle',
    
    async execute(message, args) {
        const user = database.getUser(message.author.id);
        const action = args[0]?.toLowerCase();
        
        if (!action || action === 'view') {
            return this.viewTeam(message, user);
        }
        
        if (action === 'add') {
            return this.addToTeam(message, user, args.slice(1).join(' '));
        }
        
        if (action === 'remove') {
            return this.removeFromTeam(message, user, args.slice(1).join(' '));
        }
        
        const embed = helpers.createErrorEmbed(
            'Invalid team command!\n\n' +
            '**Available commands:**\n' +
            '• `kk team` - View your current team\n' +
            '• `kk team add <animal>` - Add animal to team\n' +
            '• `kk team remove <animal>` - Remove animal from team'
        );
        
        return message.reply({ embeds: [embed] });
    },
    
    async viewTeam(message, user) {
        if (!user.team || user.team.length === 0) {
            const embed = helpers.createErrorEmbed(
                'Your team is empty!\n\n' +
                'Use `kk team add <animal>` to add animals to your battle team.\n' +
                'You can have up to 6 animals in your team.'
            );
            return message.reply({ embeds: [embed] });
        }
        
        const teamAnimals = user.team.map(animalName => {
            const animalData = animals.find(a => a.name === animalName);
            const power = this.calculateBattlePower(animalData);
            
            return {
                name: animalName,
                data: animalData,
                power: power
            };
        });
        
        const totalPower = teamAnimals.reduce((sum, animal) => sum + animal.power, 0);
        const averagePower = Math.floor(totalPower / teamAnimals.length);
        
        const embed = new EmbedBuilder()
            .setTitle(`⚔️ ${message.author.username}'s Battle Team`)
            .setDescription(
                teamAnimals.map((animal, index) => 
                    `**${index + 1}.** ${animal.data.emoji} **${animal.data.name}** (${animal.data.rarity})\n` +
                    `   Power: ${animal.power}`
                ).join('\n\n')
            )
            .setColor(config.colors.primary)
            .addFields(
                {
                    name: 'Team Stats',
                    value: `**Team Size:** ${teamAnimals.length}/6\n` +
                           `**Total Power:** ${helpers.formatNumber(totalPower)}\n` +
                           `**Average Power:** ${helpers.formatNumber(averagePower)}`,
                    inline: true
                },
                {
                    name: 'Team Tips',
                    value: '• Higher rarity = more power\n' +
                           '• Mix different rarities for balance\n' +
                           '• Full team gives bonus in battles',
                    inline: true
                }
            )
            .setFooter({ text: 'Use owo team add/remove to manage your team' })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    },
    
    async addToTeam(message, user, animalName) {
        if (!animalName) {
            const embed = helpers.createErrorEmbed('Please specify an animal to add to your team!');
            return message.reply({ embeds: [embed] });
        }
        
        // Find animal data
        const animalData = animals.find(a => a.name.toLowerCase() === animalName.toLowerCase());
        if (!animalData) {
            const embed = helpers.createErrorEmbed(`Animal "${animalName}" not found!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Check if user owns this animal
        if (!user.zoo[animalData.name] || user.zoo[animalData.name] === 0) {
            const embed = helpers.createErrorEmbed(`You don't have any ${animalData.name}s in your zoo!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Initialize team if needed
        if (!user.team) {
            user.team = [];
        }
        
        // Check team size limit
        if (user.team.length >= 6) {
            const embed = helpers.createErrorEmbed('Your team is full! Remove an animal first before adding a new one.');
            return message.reply({ embeds: [embed] });
        }
        
        // Check if animal is already in team
        if (user.team.includes(animalData.name)) {
            const embed = helpers.createErrorEmbed(`${animalData.name} is already in your team!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Add to team
        user.team.push(animalData.name);
        database.saveUser(user);
        
        const power = this.calculateBattlePower(animalData);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Animal Added to Team!')
            .setDescription(
                `Added ${animalData.emoji} **${animalData.name}** to your battle team!\n\n` +
                `**Animal Stats:**\n` +
                `• Rarity: ${animalData.rarity}\n` +
                `• Power: ${power}\n` +
                `• Team Position: ${user.team.length}/6`
            )
            .setColor(config.colors.success)
            .setFooter({ text: 'Use owo team to view your full team' })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    },
    
    async removeFromTeam(message, user, animalName) {
        if (!animalName) {
            const embed = helpers.createErrorEmbed('Please specify an animal to remove from your team!');
            return message.reply({ embeds: [embed] });
        }
        
        if (!user.team || user.team.length === 0) {
            const embed = helpers.createErrorEmbed('Your team is empty!');
            return message.reply({ embeds: [embed] });
        }
        
        // Find animal data
        const animalData = animals.find(a => a.name.toLowerCase() === animalName.toLowerCase());
        if (!animalData) {
            const embed = helpers.createErrorEmbed(`Animal "${animalName}" not found!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Check if animal is in team
        const animalIndex = user.team.indexOf(animalData.name);
        if (animalIndex === -1) {
            const embed = helpers.createErrorEmbed(`${animalData.name} is not in your team!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Remove from team
        user.team.splice(animalIndex, 1);
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Animal Removed from Team!')
            .setDescription(
                `Removed ${animalData.emoji} **${animalData.name}** from your battle team!\n\n` +
                `**Current Team Size:** ${user.team.length}/6`
            )
            .setColor(config.colors.success)
            .setFooter({ text: 'Use owo team to view your remaining team members' })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    },
    
    calculateBattlePower(animalData) {
        const rarityMultipliers = {
            common: 100,
            uncommon: 150,
            rare: 250,
            epic: 400,
            legendary: 700
        };
        
        return rarityMultipliers[animalData.rarity] || 100;
    }
};
