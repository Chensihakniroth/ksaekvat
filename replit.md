# Ksae kvat Bot - Discord Economy & Animal Collection Bot

## Overview

This is a Discord bot inspired by the popular OwO bot, featuring animal hunting, collection, battles, economy system, and gambling games. The bot is built with Discord.js v14 and uses a JSON-based file storage system for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Slot Machine Overhaul (July 29, 2025)**: Complete redesign with smooth 6-phase animations, casino-style borders, dramatic reel stopping, and professional presentation
- **Massive Payout Increases**: Boosted multipliers significantly (Diamond 100x, Star 50x, Fire 35x) with smart pair bonuses and special symbol combinations
- **KK Quick Coinflip (kcf)**: Lightning-fast all-in betting command with instant animations and double-or-nothing gameplay
- **Enhanced Visual Experience**: Dynamic color-coded animations, tier-based celebration messages, and multiple reaction emojis based on win size
- **Complete Rebranding**: Successfully changed all "OwO" references to "KK" (short) or "Ksae kvat" (full) throughout the entire bot
- **Bot Identity**: Changed bot name to "Ksae kvat" with dual prefix support (K/k)

## System Architecture

### Frontend Architecture
- **Discord Interface**: The bot operates entirely through Discord slash commands and message-based interactions
- **Embed-based UI**: Rich embeds with buttons and dropdowns for enhanced user experience
- **Interactive Components**: Action rows with buttons and select menus for command navigation

### Backend Architecture
- **Node.js Runtime**: Core application running on Node.js
- **Discord.js Framework**: Handles Discord API interactions and event management
- **Modular Command System**: Commands organized by category in separate directories
- **Event-driven Architecture**: Handlers for Discord events (ready, messageCreate, etc.)

### Data Storage Solutions
- **JSON File Storage**: Simple file-based database using JSON files
- **Data Structure**: Separate files for users, guilds, animals, and items
- **In-memory Caching**: Collections for commands and cooldowns for performance

## Key Components

### Command System
- **Handler-based Loading**: Automatic command discovery and registration
- **Category Organization**: Commands grouped by functionality (animals, economy, battle, etc.)
- **Alias Support**: Multiple command names for user convenience
- **Cooldown Management**: Rate limiting to prevent spam and abuse

### Economy System
- **Cowoncy Currency**: Primary in-game currency for transactions
- **Daily Rewards**: Daily claim system with streak bonuses
- **XP and Leveling**: Experience points and level progression
- **Payment System**: User-to-user money transfers

### Animal Collection
- **Hunting Mechanism**: Random animal discovery with rarity-based chances
- **Zoo Management**: Personal animal collections with counts
- **Selling System**: Convert animals back to currency
- **Rarity Tiers**: Common, uncommon, rare, epic, and legendary animals

### Battle System
- **Team Formation**: Players can build teams of up to 6 animals
- **Combat Mechanics**: Turn-based battles with stat calculations
- **Betting System**: Optional wagering on battle outcomes
- **Win/Loss Tracking**: Battle statistics and win rates

### Gambling Features
- **Coinflip**: Simple heads/tails betting game
- **Slot Machine**: Multi-reel slot game with various payouts
- **Betting Limits**: Configurable minimum and maximum bet amounts

## Data Flow

### User Interaction Flow
1. User sends message with bot prefix
2. Message handler validates and parses command
3. Command handler executes appropriate function
4. Database operations update user data
5. Response sent back to Discord channel

### Data Persistence Flow
1. User data loaded from JSON files on demand
2. Modifications made to in-memory objects
3. Changes saved back to JSON files immediately
4. Error handling prevents data corruption

### Economy Flow
1. Users earn currency through daily claims and activities
2. Currency spent on gambling or transferred to other users
3. XP gained through various activities for level progression
4. All transactions logged and validated

## External Dependencies

### Core Dependencies
- **discord.js**: Discord API wrapper for bot functionality
- **node-cron**: Scheduled tasks for daily resets and maintenance

### Node.js Built-ins
- **fs**: File system operations for JSON data storage
- **path**: File path manipulation utilities

### Configuration Management
- **Environment Variables**: Discord token and other sensitive data
- **Config Files**: Bot settings, economy parameters, and game balance

## Deployment Strategy

### File Structure
- Organized modular architecture with clear separation of concerns
- Commands grouped by category for maintainability
- Utility modules for shared functionality
- Data files isolated in dedicated directory

### Error Handling
- Uncaught exception and rejection handlers
- Comprehensive logging system with file output
- Graceful error responses to users

### Process Management
- Single-process architecture suitable for small to medium scale
- Cron-based scheduled tasks for maintenance
- Rate limiting to prevent abuse

### Scaling Considerations
- JSON storage appropriate for development/testing
- Ready for database migration (designed for future Postgres integration)
- Modular design allows for easy feature expansion
- Command system supports dynamic loading of new features

## Development Notes

- The bot uses a simple file-based storage system that can be easily migrated to a proper database
- All user data is stored with automatic initialization of new users
- The economy system includes configurable parameters for easy balance adjustments
- Animal data is stored separately for easy content updates
- The battle system is designed for future expansion with more complex mechanics