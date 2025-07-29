const database = require('../utils/database.js');
const rateLimiter = require('../utils/rateLimiter.js');
const helpers = require('../utils/helpers.js');
const logger = require('../utils/logger.js');
const config = require('../config/config.js');

// Track processed messages to prevent duplicates
const processedMessages = new Set();

module.exports = {
    name: 'messageCreate',

    async execute(message, client) {
        // DUPLICATE PREVENTION: Check if we already processed this message
        const messageId = `${message.id}-${message.author.id}`;
        if (processedMessages.has(messageId)) {
            console.log(`🚫 DUPLICATE BLOCKED: Already processed message ${message.id}`);
            return;
        }
        processedMessages.add(messageId);

        // Clean up old processed messages (keep only last 100)
        if (processedMessages.size > 100) {
            const oldestEntries = Array.from(processedMessages).slice(0, 50);
            oldestEntries.forEach(entry => processedMessages.delete(entry));
        }

        console.log(`✅ Processing message: "${message.content}" from ${message.author.tag}`);

        // Ignore bots and system messages
        if (message.author.bot || message.system) return;

        // Get guild settings
        const guild = message.guild ? database.getGuild(message.guild.id) : null;
        const prefix = guild?.prefix || config.prefix;

        // Check if message starts with prefix (support multiple formats)
        const validPrefixes = [
            'K',                 // "K"
            'k',                 // "k" 
            'kk',                // "kk"
            'KK'                 // "KK"
        ];

        // Special handling for admin "Kgive" command
        if (message.content.startsWith('Kgive') && message.author.id === config.adminId) {
            const args = message.content.slice(5).trim().split(/ +/);
            const command = client.commands.get('give');
            if (command) {
                try {
                    await command.execute(message, args, client);
                } catch (error) {
                    logger.error('Error executing Kgive command:', error);
                }
            }
            return;
        }

        let usedPrefix = null;
        let commandContent = null;

        // Check for prefixes
        for (const prefixToCheck of validPrefixes) {
            if (message.content.toLowerCase().startsWith(prefixToCheck.toLowerCase())) {
                usedPrefix = prefixToCheck;
                commandContent = message.content.slice(prefixToCheck.length).trim();
                break;
            }
        }

        if (!usedPrefix) {
            // Award XP for regular chatting (with rate limiting)
            if (message.guild && !rateLimiter.isOnCooldown(message.author.id, 'chat-xp', 60000)) {
                const user = database.getUser(message.author.id);
                const xpGain = Math.floor(Math.random() * 5) + 1;
                const xpResult = helpers.addXP(user, xpGain);

                database.saveUser(user);
                rateLimiter.setCooldown(message.author.id, 'chat-xp', 60000);

                // Send level up message
                if (xpResult.levelUp) {
                    const levelUpEmbed = helpers.createSuccessEmbed(
                        `🎉 **${message.author.username}** leveled up to level **${xpResult.newLevel}**!`
                    );
                    message.channel.send({ embeds: [levelUpEmbed] }).catch(() => {});
                }
            }
            return;
        }

        // Parse command and arguments
        const args = commandContent.trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        console.log(`🎯 Executing command: ${commandName} with args: ${args.join(', ')}`);

        // Get command
        const command = client.commands.get(commandName);
        if (!command) return;

        // Check if command is disabled in this guild
        if (guild?.disabledCommands?.includes(command.name)) {
            return; // Silently ignore disabled commands
        }

        // Check cooldown
        if (command.cooldown && rateLimiter.isOnCooldown(message.author.id, command.name, command.cooldown)) {
            const remaining = rateLimiter.getRemainingCooldown(message.author.id, command.name, command.cooldown);
            const embed = helpers.createErrorEmbed(
                `You need to wait **${helpers.formatTime(remaining)}** before using \`${command.name}\` again!`
            );

            const cooldownMessage = await message.reply({ embeds: [embed] });

            // Delete cooldown message after a few seconds
            setTimeout(() => {
                cooldownMessage.delete().catch(() => {});
            }, 5000);

            return;
        }

        try {
            // Execute command (commands handle their own cooldowns)
            await command.execute(message, args, client, commandName);

            logger.info(`Command executed: ${command.name} by ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}`);

        } catch (error) {
            logger.error(`Error executing command ${command.name}:`, error);

            const errorEmbed = helpers.createErrorEmbed(
                'There was an error executing this command!\n' +
                'The error has been logged and will be investigated.'
            );

            try {
                await message.reply({ embeds: [errorEmbed] });
            } catch (replyError) {
                logger.error('Failed to send error message:', replyError);
            }
        }
    }
};