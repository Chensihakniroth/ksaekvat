const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config/config.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Get help with bot commands',
    usage: 'help [command]',
    cooldown: 5000,
    category: 'general',
    
    async execute(message, args) {
        const commandName = args[0];
        
        if (commandName) {
            return this.showCommandHelp(message, commandName);
        }
        
        return this.showMainHelp(message);
    },
    
    async showMainHelp(message) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 KK Bot Help')
            .setDescription(
                `Welcome to the Ksae kvat Bot! Here are all the available commands.\n` +
                `Use the dropdown menu below to see commands by category.\n\n` +
                `**Prefixes:** \`${config.prefix}\`, \`${config.prefix.toLowerCase()}\`, \`kk \`, or \`kk\`\n` +
                `**Examples:** \`${config.prefix}hunt\`, \`kk hunt\`, or \`kkhunt\``
            )
            .setColor(config.colors.primary)
            .addFields(
                {
                    name: '🦁 Animals',
                    value: 'Hunt, collect, and manage your zoo',
                    inline: true
                },
                {
                    name: '💰 Economy',
                    value: 'Earn and spend cowoncy',
                    inline: true
                },
                {
                    name: '⚔️ Battle',
                    value: 'Fight with your animals',
                    inline: true
                },
                {
                    name: '🎰 Gambling',
                    value: 'Test your luck with games',
                    inline: true
                },
                {
                    name: '👤 Profile',
                    value: 'View stats and inventory',
                    inline: true
                },
                {
                    name: '⚙️ General',
                    value: 'Basic bot commands',
                    inline: true
                }
            )
            .setFooter({ text: 'Select a category from the dropdown below!' })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help-category')
                    .setPlaceholder('Choose a category...')
                    .addOptions([
                        {
                            label: 'Animals',
                            description: 'Hunt and zoo management commands',
                            value: 'animals',
                            emoji: '🦁'
                        },
                        {
                            label: 'Economy',
                            description: 'Money and daily reward commands',
                            value: 'economy',
                            emoji: '💰'
                        },
                        {
                            label: 'Battle',
                            description: 'Combat and team commands',
                            value: 'battle',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Gambling',
                            description: 'Slots and coinflip commands',
                            value: 'gambling',
                            emoji: '🎰'
                        },
                        {
                            label: 'Profile',
                            description: 'Stats and inventory commands',
                            value: 'profile',
                            emoji: '👤'
                        },
                        {
                            label: 'General',
                            description: 'Basic utility commands',
                            value: 'general',
                            emoji: '⚙️'
                        }
                    ])
            );
        
        const response = await message.reply({ embeds: [embed], components: [row] });
        
        // Handle dropdown interactions
        const collector = response.createMessageComponentCollector({ time: 300000 }); // 5 minutes
        
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ 
                    content: 'You cannot use this menu!', 
                    ephemeral: true 
                });
            }
            
            const category = interaction.values[0];
            const categoryEmbed = this.getCategoryEmbed(category);
            
            await interaction.update({ embeds: [categoryEmbed], components: [row] });
        });
        
        collector.on('end', () => {
            row.components[0].setDisabled(true);
            response.edit({ components: [row] }).catch(() => {});
        });
    },
    
    getCategoryEmbed(category) {
        const commands = {
            animals: [
                { name: 'hunt', aliases: ['h', 'catch'], description: 'Hunt for animals to add to your zoo' },
                { name: 'zoo', aliases: ['collection'], description: 'View your animal collection' },
                { name: 'sell', aliases: ['sell-animals'], description: 'Sell animals from your zoo' }
            ],
            economy: [
                { name: 'daily', aliases: ['d'], description: 'Claim your daily cowoncy reward' },
                { name: 'balance', aliases: ['bal', 'money'], description: 'Check your cowoncy balance' },
                { name: 'pay', aliases: ['give'], description: 'Pay cowoncy to another user' }
            ],
            battle: [
                { name: 'battle', aliases: ['fight', 'duel'], description: 'Battle another user with your animals' },
                { name: 'team', aliases: ['squad'], description: 'Manage your battle team' }
            ],
            gambling: [
                { name: 'slots', aliases: ['slot', 's', 'S'], description: 'Play the slot machine - use "all" to bet everything (max 250k)' },
                { name: 'coinflip', aliases: ['cf', 'kcf'], description: 'Flip a coin and bet on heads (h/H) or tails (t/T) - use "all" to bet everything (max 250k)' }
            ],
            profile: [
                { name: 'profile', aliases: ['p', 'stats'], description: 'View your profile and stats' },
                { name: 'inventory', aliases: ['inv', 'items'], description: 'View your inventory' }
            ],
            general: [
                { name: 'help', aliases: ['h', 'commands'], description: 'Get help with bot commands' },
                { name: 'ping', aliases: [], description: 'Check bot latency' },
                { name: 'slap', aliases: ['kill', 'fuck', 'kiss', 'lick', 'kick', 'spank'], description: 'Send fun GIF interactions to other users' }
            ]
        };
        
        const categoryInfo = {
            animals: { emoji: '🦁', name: 'Animals', color: config.colors.success },
            economy: { emoji: '💰', name: 'Economy', color: config.colors.warning },
            battle: { emoji: '⚔️', name: 'Battle', color: config.colors.error },
            gambling: { emoji: '🎰', name: 'Gambling', color: config.colors.info },
            profile: { emoji: '👤', name: 'Profile', color: config.colors.primary },
            general: { emoji: '⚙️', name: 'General', color: '#95a5a6' }
        };
        
        const info = categoryInfo[category];
        const categoryCommands = commands[category] || [];
        
        const embed = new EmbedBuilder()
            .setTitle(`${info.emoji} ${info.name} Commands`)
            .setColor(info.color)
            .setDescription(
                categoryCommands.map(cmd => 
                    `**${config.prefix}${cmd.name}** ${cmd.aliases.length > 0 ? `(${cmd.aliases.map(a => `\`${a}\``).join(', ')})` : ''}\n` +
                    `${cmd.description}`
                ).join('\n\n')
            )
            .setFooter({ text: `Use ${config.prefix}help <command> for detailed information about a specific command` })
            .setTimestamp();
        
        return embed;
    },
    
    async showCommandHelp(message, commandName) {
        const command = message.client.commands.get(commandName);
        
        if (!command) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Command Not Found')
                .setDescription(`Command \`${commandName}\` was not found!`)
                .setColor(config.colors.error);
            
            return message.reply({ embeds: [embed] });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📖 Command: ${command.name}`)
            .setDescription(command.description || 'No description available')
            .setColor(config.colors.primary)
            .addFields(
                {
                    name: 'Usage',
                    value: `\`${config.prefix}${command.usage || command.name}\``,
                    inline: true
                },
                {
                    name: 'Category',
                    value: command.category || 'General',
                    inline: true
                },
                {
                    name: 'Cooldown',
                    value: command.cooldown ? `${command.cooldown / 1000}s` : 'None',
                    inline: true
                }
            )
            .setTimestamp();
        
        if (command.aliases && command.aliases.length > 0) {
            embed.addFields({
                name: 'Aliases',
                value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: false
            });
        }
        
        return message.reply({ embeds: [embed] });
    }
};
