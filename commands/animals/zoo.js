const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');
const animals = require('../../data/animals.json');

module.exports = {
    name: 'zoo',
    aliases: ['collection', 'animals'],
    description: 'View your animal collection',
    usage: 'zoo [@user] [rarity]',
    cooldown: 3000,
    category: 'animals',
    
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const user = database.getUser(target.id);
        const filterRarity = args.find(arg => 
            ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(arg.toLowerCase())
        )?.toLowerCase();
        
        if (Object.keys(user.zoo).length === 0) {
            const embed = helpers.createErrorEmbed(
                target.id === message.author.id 
                    ? 'Your zoo is empty! Use `kk hunt` to catch some animals!'
                    : `${target.username}'s zoo is empty!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        // Get all animals user owns
        const ownedAnimals = [];
        for (const [animalName, count] of Object.entries(user.zoo)) {
            const animalData = animals.find(a => a.name === animalName);
            if (animalData && count > 0) {
                if (!filterRarity || animalData.rarity === filterRarity) {
                    ownedAnimals.push({
                        ...animalData,
                        count: count,
                        value: helpers.getAnimalValue(animalData) * count
                    });
                }
            }
        }
        
        if (ownedAnimals.length === 0) {
            const embed = helpers.createErrorEmbed(
                filterRarity 
                    ? `No ${filterRarity} animals found in ${target.username}'s zoo!`
                    : `${target.username}'s zoo is empty!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        // Sort by rarity then by count
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        ownedAnimals.sort((a, b) => {
            if (a.rarity !== b.rarity) {
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            }
            return b.count - a.count;
        });
        
        // Calculate total value
        const totalValue = ownedAnimals.reduce((sum, animal) => sum + animal.value, 0);
        const totalAnimals = ownedAnimals.reduce((sum, animal) => sum + animal.count, 0);
        
        // Create pages (10 animals per page)
        const pages = [];
        const animalsPerPage = 10;
        
        for (let i = 0; i < ownedAnimals.length; i += animalsPerPage) {
            const pageAnimals = ownedAnimals.slice(i, i + animalsPerPage);
            const pageNumber = Math.floor(i / animalsPerPage) + 1;
            const totalPages = Math.ceil(ownedAnimals.length / animalsPerPage);
            
            const description = pageAnimals.map(animal => 
                `${animal.emoji} **${animal.name}** (${animal.rarity}) - ${animal.count}x\n` +
                `   Value: ${helpers.formatNumber(animal.value)} ${config.emojis.cowoncy}`
            ).join('\n\n');
            
            const embed = new EmbedBuilder()
                .setTitle(`🦁 ${target.username}'s Zoo ${filterRarity ? `(${filterRarity})` : ''}`)
                .setDescription(description)
                .setColor(config.colors.primary)
                .addFields(
                    {
                        name: 'Collection Stats',
                        value: `**Total Animals:** ${helpers.formatNumber(totalAnimals)}\n` +
                               `**Total Value:** ${helpers.formatNumber(totalValue)} ${config.emojis.cowoncy}\n` +
                               `**Unique Species:** ${ownedAnimals.length}`,
                        inline: true
                    }
                )
                .setFooter({ text: `Page ${pageNumber}/${totalPages} • Use kk sell <animal> to sell animals` })
                .setTimestamp();
            
            if (target.displayAvatarURL) {
                embed.setThumbnail(target.displayAvatarURL({ dynamic: true, size: 128 }));
            }
            
            pages.push(embed);
        }
        
        // If only one page, send directly
        if (pages.length === 1) {
            return message.reply({ embeds: [pages[0]] });
        }
        
        // Multi-page with navigation buttons
        let currentPage = 0;
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next ▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pages.length <= 1)
            );
        
        const response = await message.reply({ 
            embeds: [pages[currentPage]], 
            components: [row] 
        });
        
        // Button collector
        const collector = response.createMessageComponentCollector({ 
            time: 60000 // 1 minute
        });
        
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ 
                    content: 'You cannot use these buttons!', 
                    ephemeral: true 
                });
            }
            
            if (interaction.customId === 'prev') {
                currentPage--;
            } else if (interaction.customId === 'next') {
                currentPage++;
            }
            
            // Update button states
            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === pages.length - 1);
            
            await interaction.update({ 
                embeds: [pages[currentPage]], 
                components: [row] 
            });
        });
        
        collector.on('end', () => {
            row.components.forEach(button => button.setDisabled(true));
            response.edit({ components: [row] }).catch(() => {});
        });
    }
};
