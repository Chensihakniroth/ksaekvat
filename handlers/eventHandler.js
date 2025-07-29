const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

module.exports = (client) => {
    const eventFiles = fs.readdirSync(path.join(__dirname, '../events'))
        .filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const event = require(path.join(__dirname, `../events/${file}`));
        const eventName = file.split('.')[0];
        
        if (event.once) {
            client.once(eventName, (...args) => event.execute(...args, client));
        } else {
            client.on(eventName, (...args) => event.execute(...args, client));
        }
        
        logger.info(`Loaded event: ${eventName}`);
    }
};
