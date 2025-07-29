const { ActivityType } = require('discord.js');
const logger = require('../utils/logger.js');
const config = require('../config/config.js');

module.exports = {
    name: 'ready',
    once: true,
    
    execute(client) {
        logger.info(`Bot logged in as ${client.user.tag}`);
        logger.info(`Bot is in ${client.guilds.cache.size} servers`);
        logger.info(`Serving ${client.users.cache.size} users`);
        
        // Set bot activity
        const activities = [
            `${config.prefix}help | Hunting animals!`,
            `${config.prefix}hunt | Collecting pets!`,
            `${config.prefix}daily | Earning KK coins!`,
            `in ${client.guilds.cache.size} servers!`
        ];
        
        let activityIndex = 0;
        
        // Set initial activity
        client.user.setActivity(activities[activityIndex], { type: ActivityType.Playing });
        
        // Rotate activities every 30 seconds
        setInterval(() => {
            activityIndex = (activityIndex + 1) % activities.length;
            client.user.setActivity(activities[activityIndex], { type: ActivityType.Playing });
        }, 30000);
        
        logger.info('Bot is ready and operational!');
    }
};
