const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

module.exports = (client) => {
    const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));
    
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../commands/${folder}`))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../commands/${folder}/${file}`));
            
            if (command.name) {
                client.commands.set(command.name, command);
                
                // Set aliases
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.commands.set(alias, command);
                    });
                }
                
                logger.info(`Loaded command: ${command.name}`);
            } else {
                logger.warn(`Command file ${file} is missing a name property`);
            }
        }
    }
};
