const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logPath = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        if (!fs.existsSync(this.logPath)) {
            fs.mkdirSync(this.logPath, { recursive: true });
        }
    }
    
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' ');
        
        return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
    }
    
    writeToFile(level, formattedMessage) {
        const filename = `${new Date().toISOString().split('T')[0]}.log`;
        const filepath = path.join(this.logPath, filename);
        
        fs.appendFileSync(filepath, formattedMessage + '\n');
    }
    
    log(level, message, ...args) {
        const formattedMessage = this.formatMessage(level, message, ...args);
        
        // Console output with colors
        const colors = {
            info: '\x1b[36m',    // Cyan
            warn: '\x1b[33m',    // Yellow
            error: '\x1b[31m',   // Red
            debug: '\x1b[35m',   // Magenta
            reset: '\x1b[0m'     // Reset
        };
        
        console.log(`${colors[level] || ''}${formattedMessage}${colors.reset}`);
        
        // Write to file
        this.writeToFile(level, formattedMessage);
    }
    
    info(message, ...args) {
        this.log('info', message, ...args);
    }
    
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }
    
    error(message, ...args) {
        this.log('error', message, ...args);
    }
    
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
}

module.exports = new Logger();
