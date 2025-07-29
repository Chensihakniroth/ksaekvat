const { EmbedBuilder } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');
const animals = require('../../data/animals.json');

module.exports = {
    name: 'sell',
    aliases: ['sell-animals'],
    description: 'Sell animals from your zoo',
    usage: 'sell <animal> [amount] | sell <rarity> [amount] | sell all',
    cooldown: 3000,
    category: 'animals',
    
    async execute(message, args) {
        if (args.length === 0) {
            const embed = helpers.createErrorEmbed(
                'Please specify what to sell!\n\n' +
                '**Examples:**\n' +
                '• `kk sell rabbit` - Sell 1 rabbit\n' +
                '• `kk sell rabbit 5` - Sell 5 rabbits\n' +
                '• `kk sell common` - Sell all common animals\n' +
                '• `kk sell all` - Sell all animals'
            );
            return message.reply({ embeds: [embed] });
        }
        
        const user = database.getUser(message.author.id);
        
        if (Object.keys(user.zoo).length === 0) {
            const embed = helpers.createErrorEmbed('Your zoo is empty! Use `kk hunt` to catch some animals first!');
            return message.reply({ embeds: [embed] });
        }
        
        const target = args[0].toLowerCase();
        const amount = parseInt(args[1]) || 1;
        
        if (target === 'all') {
            return this.sellAll(message, user);
        }
        
        // Check if selling by rarity
        const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        if (rarities.includes(target)) {
            return this.sellByRarity(message, user, target, amount);
        }
        
        // Sell specific animal
        return this.sellAnimal(message, user, target, amount);
    },
    
    async sellAnimal(message, user, animalName, amount) {
        // Find animal data
        const animalData = animals.find(a => a.name.toLowerCase() === animalName);
        if (!animalData) {
            const embed = helpers.createErrorEmbed(`Animal "${animalName}" not found!`);
            return message.reply({ embeds: [embed] });
        }
        
        const userAnimalCount = user.zoo[animalData.name] || 0;
        if (userAnimalCount === 0) {
            const embed = helpers.createErrorEmbed(`You don't have any ${animalData.name}s in your zoo!`);
            return message.reply({ embeds: [embed] });
        }
        
        if (amount > userAnimalCount) {
            const embed = helpers.createErrorEmbed(
                `You only have **${userAnimalCount}** ${animalData.name}${userAnimalCount > 1 ? 's' : ''}, but tried to sell **${amount}**!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        if (amount <= 0) {
            const embed = helpers.createErrorEmbed('Amount must be greater than 0!');
            return message.reply({ embeds: [embed] });
        }
        
        // Calculate sale value
        const unitValue = helpers.getAnimalValue(animalData);
        const totalValue = unitValue * amount;
        
        // Update user data
        user.zoo[animalData.name] -= amount;
        if (user.zoo[animalData.name] === 0) {
            delete user.zoo[animalData.name];
        }
        user.cowoncy += totalValue;
        
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle('💰 Sale Successful!')
            .setColor(config.colors.success)
            .setDescription(
                `You sold **${amount}** ${animalData.emoji} **${animalData.name}${amount > 1 ? 's' : ''}** for **${helpers.formatNumber(totalValue)}** ${config.emojis.cowoncy}!\n\n` +
                `**Your new balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .addFields({
                name: 'Sale Details',
                value: `**Unit Price:** ${helpers.formatNumber(unitValue)} ${config.emojis.cowoncy}\n` +
                       `**Amount Sold:** ${amount}\n` +
                       `**Remaining:** ${user.zoo[animalData.name] || 0}`,
                inline: true
            })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    },
    
    async sellByRarity(message, user, rarity, maxAmount = Infinity) {
        const animalsToSell = [];
        let totalSold = 0;
        let totalValue = 0;
        
        for (const [animalName, count] of Object.entries(user.zoo)) {
            if (totalSold >= maxAmount) break;
            
            const animalData = animals.find(a => a.name === animalName);
            if (animalData && animalData.rarity === rarity && count > 0) {
                const sellAmount = Math.min(count, maxAmount - totalSold);
                const unitValue = helpers.getAnimalValue(animalData);
                const saleValue = unitValue * sellAmount;
                
                animalsToSell.push({
                    name: animalName,
                    data: animalData,
                    amount: sellAmount,
                    value: saleValue
                });
                
                totalSold += sellAmount;
                totalValue += saleValue;
            }
        }
        
        if (animalsToSell.length === 0) {
            const embed = helpers.createErrorEmbed(`You don't have any ${rarity} animals to sell!`);
            return message.reply({ embeds: [embed] });
        }
        
        // Update user data
        animalsToSell.forEach(sale => {
            user.zoo[sale.name] -= sale.amount;
            if (user.zoo[sale.name] === 0) {
                delete user.zoo[sale.name];
            }
        });
        
        user.cowoncy += totalValue;
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle(`💰 ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Animals Sold!`)
            .setColor(config.colors.success)
            .setDescription(
                `You sold **${totalSold}** ${rarity} animals for **${helpers.formatNumber(totalValue)}** ${config.emojis.cowoncy}!\n\n` +
                `**Your new balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .addFields({
                name: 'Animals Sold',
                value: animalsToSell.slice(0, 10).map(sale => 
                    `${sale.data.emoji} ${sale.name}: ${sale.amount}x (${helpers.formatNumber(sale.value)} ${config.emojis.cowoncy})`
                ).join('\n') + (animalsToSell.length > 10 ? `\n...and ${animalsToSell.length - 10} more` : ''),
                inline: false
            })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    },
    
    async sellAll(message, user) {
        let totalSold = 0;
        let totalValue = 0;
        const salesByRarity = {};
        
        for (const [animalName, count] of Object.entries(user.zoo)) {
            const animalData = animals.find(a => a.name === animalName);
            if (animalData && count > 0) {
                const unitValue = helpers.getAnimalValue(animalData);
                const saleValue = unitValue * count;
                
                totalSold += count;
                totalValue += saleValue;
                
                if (!salesByRarity[animalData.rarity]) {
                    salesByRarity[animalData.rarity] = { count: 0, value: 0 };
                }
                salesByRarity[animalData.rarity].count += count;
                salesByRarity[animalData.rarity].value += saleValue;
            }
        }
        
        if (totalSold === 0) {
            const embed = helpers.createErrorEmbed('You don\'t have any animals to sell!');
            return message.reply({ embeds: [embed] });
        }
        
        // Clear zoo and add cowoncy
        user.zoo = {};
        user.cowoncy += totalValue;
        database.saveUser(user);
        
        const embed = new EmbedBuilder()
            .setTitle('🔥 Sold Everything!')
            .setColor(config.colors.success)
            .setDescription(
                `You sold **ALL** your animals (**${totalSold}** total) for **${helpers.formatNumber(totalValue)}** ${config.emojis.cowoncy}!\n\n` +
                `**Your new balance:** ${helpers.formatNumber(user.cowoncy)} ${config.emojis.cowoncy}`
            )
            .addFields({
                name: 'Sales Breakdown',
                value: Object.entries(salesByRarity)
                    .sort(([,a], [,b]) => b.value - a.value)
                    .map(([rarity, data]) => 
                        `**${rarity}:** ${data.count}x - ${helpers.formatNumber(data.value)} ${config.emojis.cowoncy}`
                    ).join('\n'),
                inline: false
            })
            .setFooter({ text: 'Time to start hunting again!' })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }
};
