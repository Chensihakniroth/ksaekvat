module.exports = {
    // Bot configuration
    token: process.env.DISCORD_TOKEN || "your_token",
    prefix: process.env.PREFIX || "K",
    
    // All betting cap
    allBetCap: 250000,

    // Admin configuration
    adminId: "387812028913418240", // Your Discord user ID
    adminId: "1160984144290005012", // Your Discord user ID

    // Economy settings
    economy: {
        dailyAmount: 1000,
        huntCooldown: 15000, // 15 seconds
        battleCooldown: 30000, // 30 seconds
        maxBet: 50000000, // 50 million for testing
        minBet: 10,
    },

    // Animal rarities and their chances
    animalRarities: {
        common: { chance: 0.6, multiplier: 1 },
        uncommon: { chance: 0.25, multiplier: 2 },
        rare: { chance: 0.1, multiplier: 5 },
        epic: { chance: 0.04, multiplier: 10 },
        legendary: { chance: 0.01, multiplier: 25 },
    },

    // Colors for embeds
    colors: {
        primary: "#ff6b9d",
        success: "#51cf66",
        error: "#ff6b6b",
        warning: "#ffd43b",
        info: "#74c0fc",
    },

    // Emojis
    emojis: {
        cowoncy: "💰",
        gem: "💎",
        heart: "❤️",
        star: "⭐",
        trophy: "🏆",
        dice: "🎲",
        slot: "🎰",
    },
};
