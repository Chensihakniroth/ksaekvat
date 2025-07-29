const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

class Database {
    constructor() {
        this.dataPath = path.join(__dirname, '../data');
        this.ensureDataDirectory();
    }
    
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
        
        // Initialize default data files if they don't exist
        const defaultFiles = {
            'users.json': {},
            'guilds.json': {}
        };
        
        Object.keys(defaultFiles).forEach(filename => {
            const filepath = path.join(this.dataPath, filename);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, JSON.stringify(defaultFiles[filename], null, 2));
            }
        });
    }
    
    loadData(filename) {
        try {
            const filepath = path.join(this.dataPath, filename);
            if (!fs.existsSync(filepath)) {
                return {};
            }
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            logger.error(`Error loading data from ${filename}:`, error);
            return {};
        }
    }
    
    saveData(filename, data) {
        try {
            const filepath = path.join(this.dataPath, filename);
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        } catch (error) {
            logger.error(`Error saving data to ${filename}:`, error);
        }
    }
    
    getUser(userId) {
        const users = this.loadData('users.json');
        if (!users[userId]) {
            users[userId] = this.createDefaultUser(userId);
            this.saveData('users.json', users);
        }
        return users[userId];
    }
    
    saveUser(userData) {
        const users = this.loadData('users.json');
        users[userData.id] = userData;
        this.saveData('users.json', users);
    }
    
    getAllUsers() {
        const users = this.loadData('users.json');
        return Object.values(users);
    }
    
    createDefaultUser(userId) {
        return {
            id: userId,
            cowoncy: 100,
            dailyClaimed: false,
            lastDaily: null,
            lastHunt: null,
            lastBattle: null,
            zoo: {},
            inventory: {},
            level: 1,
            xp: 0,
            battlesWon: 0,
            battlesLost: 0,
            animalsHunted: 0,
            marriedTo: null,
            team: []
        };
    }
    
    getGuild(guildId) {
        const guilds = this.loadData('guilds.json');
        if (!guilds[guildId]) {
            guilds[guildId] = this.createDefaultGuild(guildId);
            this.saveData('guilds.json', guilds);
        }
        return guilds[guildId];
    }
    
    saveGuild(guildData) {
        const guilds = this.loadData('guilds.json');
        guilds[guildData.id] = guildData;
        this.saveData('guilds.json', guilds);
    }
    
    createDefaultGuild(guildId) {
        return {
            id: guildId,
            prefix: 'kk ',
            disabledCommands: [],
            settings: {
                huntChannel: null,
                battleChannel: null
            }
        };
    }
}

module.exports = new Database();
