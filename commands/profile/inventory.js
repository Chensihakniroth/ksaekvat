const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const database = require('../../utils/database.js');
const helpers = require('../../utils/helpers.js');
const config = require('../../config/config.js');
const items = require('../../data/items.json');

module.exports = {
    name: 'inventory',
    aliases: ['inv', 'items'],
    description: 'View your inventory',
    usage: 'inventory [@user]',
    cooldown: 3000,
    category: 'profile',
    
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const user = database.getUser(target.id);
        
        if (!user.inventory || Object.keys(user.inventory).length === 0) {
            const embed = helpers.createErrorEmbed(
                target.id === message.author.id 
                    ? 'Your inventory is empty! Hunt animals and play games to earn items!'
                    : `${target.username}'s inventory is empty!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        // Get all items user owns
        const ownedItems = [];
        for (const [itemName, count] of Object.entries(user.inventory)) {
            const itemData = items.find(i => i.name === itemName);
            if (itemData && count > 0) {
                ownedItems.push({
                    ...itemData,
                    count: count,
                    totalValue: itemData.value * count
                });
            }
        }
        
        if (ownedItems.length === 0) {
            const embed = helpers.createErrorEmbed(
                `${target.username}'s inventory is empty!`
            );
            return message.reply({ embeds: [embed] });
        }
        
        // Sort by value then by count
        ownedItems.sort((a, b) => {
            if (a.rarity !== b.rarity) {
                const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
            }
            return b.totalValue - a.totalValue;
        });
        
        // Calculate total value
        const totalValue = ownedItems.reduce((sum, item) => sum + item.totalValue, 0);
        const totalItems = ownedItems.reduce((sum, item) => sum + item.count, 0);
        
        // Create pages (8 items per page)
        const pages = [];
        const itemsPerPage = 8;
        
        for (let i = 0; i < ownedItems.length; i += itemsPerPage) {
            const pageItems = ownedItems.slice(i, i + itemsPerPage);
            const pageNumber = Math.floor(i / itemsPerPage) + 1;
            const totalPages = Math.ceil(ownedItems.length / itemsPerPage);
            
            const description = pageItems.map(item => 
                `${item.emoji} **${item.name}** ${item.rarity ? `(${item.rarity})` : ''}\n` +
                `   ${item.description}\n` +
                `   **Owned:** ${item.count}x | **Value:** ${helpers.formatNumber(item.totalValue)} ${config.emojis.cowoncy}`
            ).join('\n\n');
            
            const embed = new EmbedBuilder()
                .setTitle(`🎒 ${target.username}'s Inventory`)
                .setDescription(description)
                .setColor(config.colors.primary)
                .addFields(
                    {
                        name: 'Inventory Stats',
                        value: `**Total Items:** ${helpers.formatNumber(totalItems)}\n` +
                               `**Total Value:** ${helpers.formatNumber(totalValue)} ${config.emojis.cowoncy}\n` +
                               `**Unique Items:** ${ownedItems.length}`,
                        inline: true
                    }
                )
                .setFooter({ text: `Page ${pageNumber}/${totalPages} • Use items with their respective commands` })
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
