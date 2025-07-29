const { EmbedBuilder } = require("discord.js");
const database = require("../../utils/database.js");
const helpers = require("../../utils/helpers.js");
const rateLimiter = require("../../utils/rateLimiter.js");
const config = require("../../config/config.js");

module.exports = {
    name: "slots",
    aliases: ["slot", "s", "spin"],
    description: "Play the ultra-fast slot machine!",
    usage: "slots <bet|all|half|quarter>",
    cooldown: 2000, // Even faster cooldown
    category: "gambling",

    async execute(message, args) {
        const userId = message.author.id;
        const user = database.getUser(userId);

        // Instant cooldown check
        if (rateLimiter.isOnCooldown(userId, "slots", this.cooldown)) {
            return message
                .reply({
                    embeds: [
                        helpers.createErrorEmbed(
                            `⌛ Wait ${helpers.formatTime(rateLimiter.getRemainingCooldown(userId, "slots", this.cooldown))}`,
                        ),
                    ],
                })
                .then((msg) => setTimeout(() => msg.delete(), 3000));
        }
        rateLimiter.setCooldown(userId, "slots", this.cooldown);

        // Lightning-fast input validation
        if (!args[0]) {
            return message.reply({
                embeds: [
                    helpers.createErrorEmbed(
                        `⚡ \`${config.prefix}slots <amount|all|half|quarter>\``,
                    ),
                ],
                ephemeral: true,
            });
        }

        // Blazing-fast bet processing
        const betArg = args[0].toLowerCase();
        let bet,
            betType = "normal";
        const balance = user.cowoncy;

        switch (betArg) {
            case "all":
                bet = Math.min(balance, config.allBetCap || 250000);
                betType = "all";
                break;
            case "half":
                bet = Math.floor(balance / 2);
                betType = "half";
                break;
            case "quarter":
                bet = Math.floor(balance / 4);
                betType = "quarter";
                break;
            default:
                bet = parseInt(args[0].replace(/\D/g, "")) || 0;
        }

        // Instant validation
        if (bet < config.economy.minBet) {
            return message.reply({
                embeds: [
                    helpers.createErrorEmbed(
                        `📉 Min: ${config.economy.minBet}${config.emojis.cowoncy}`,
                    ),
                ],
                ephemeral: true,
            });
        }
        if (bet > Math.min(config.economy.maxBet, balance)) {
            return message.reply({
                embeds: [
                    helpers.createErrorEmbed(
                        `📈 Max: ${helpers.formatNumber(Math.min(config.economy.maxBet, balance))}${config.emojis.cowoncy}`,
                    ),
                ],
                ephemeral: true,
            });
        }

        // Generate reels in one go
        const symbols = [
            { emoji: "🍒", name: "Cherry", weight: 35, match3: 8, match2: 1.5 },
            { emoji: "🍋", name: "Lemon", weight: 30, match3: 12, match2: 2 },
            {
                emoji: "🍊",
                name: "Orange",
                weight: 25,
                match3: 18,
                match2: 2.5,
            },
            { emoji: "🍇", name: "Grape", weight: 20, match3: 25, match2: 3 },
            {
                emoji: "🍉",
                name: "Watermelon",
                weight: 15,
                match3: 35,
                match2: 4,
            },
            {
                emoji: "⭐",
                name: "Star",
                weight: 10,
                match3: 50,
                match2: 5,
                special: true,
            },
            {
                emoji: "💎",
                name: "Diamond",
                weight: 5,
                match3: 100,
                match2: 10,
                special: true,
            },
        ];

        const finalReels = Array(3)
            .fill()
            .map(() => this.getWeightedSymbol(symbols));

        // Single message with instant animation
        const spinMsg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎰 SLOTS")
                    .setDescription(
                        `**[ 🎰 | 🎰 | 🎰 ]**\n💰 ${helpers.formatNumber(bet)}${config.emojis.cowoncy}`,
                    )
                    .setColor("#5865F2"),
            ],
        });

        // Micro-optimized animation (2 steps)
        await Promise.all([
            this.sleep(200),
            spinMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎰 SLOTS")
                        .setDescription(
                            `**[ ${finalReels[0].emoji} | 🎰 | 🎰 ]**\n💰 ${helpers.formatNumber(bet)}${config.emojis.cowoncy}`,
                        )
                        .setColor("#5865F2"),
                ],
            }),
        ]);

        await Promise.all([
            this.sleep(150),
            spinMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎰 SLOTS")
                        .setDescription(
                            `**[ ${finalReels[0].emoji} | ${finalReels[1].emoji} | 🎰 ]**\n💰 ${helpers.formatNumber(bet)}${config.emojis.cowoncy}`,
                        )
                        .setColor("#5865F2"),
                ],
            }),
        ]);

        // Calculate and apply results
        const result = this.calculateResult(finalReels, bet);
        user.cowoncy += result.winnings - bet;
        helpers.addXP(user, Math.floor(bet / 25)); // Slightly more XP for faster game
        database.saveUser(user);

        // Final result with color-coded embed
        const resultColor =
            result.winnings > bet
                ? "#57F287"
                : result.winnings > 0
                  ? "#FEE75C"
                  : "#ED4245";

        await spinMsg.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🎰 RESULTS")
                    .setDescription(
                        `**[ ${finalReels.map((r) => r.emoji).join(" | ")} ]**\n\n` +
                            `💰 BET: ${helpers.formatNumber(bet)}${config.emojis.cowoncy}\n` +
                            (result.winnings > 0
                                ? `✅ WON: ${helpers.formatNumber(result.winnings)}${config.emojis.cowoncy} (${result.multiplier}x)\n` +
                                  `📈 PROFIT: ${result.winnings - bet >= 0 ? "+" : ""}${helpers.formatNumber(result.winnings - bet)}`
                                : `❌ LOST: ${helpers.formatNumber(bet)}`) +
                            `\n\n💳 BALANCE: ${helpers.formatNumber(user.cowoncy)}${config.emojis.cowoncy}`,
                    )
                    .setColor(resultColor)
                    .setFooter({ text: result.message }),
            ],
        });

        // Instant reaction
        await spinMsg
            .react(
                result.multiplier >= 10
                    ? "🎉"
                    : result.winnings > bet
                      ? "💰"
                      : "😢",
            )
            .catch(() => {});
    },

    // Ultra-optimized result calculation
    calculateResult([a, b, c], bet) {
        // Three matching
        if (a.name === b.name && b.name === c.name) {
            return {
                winnings: bet * a.match3,
                multiplier: a.match3,
                message: `🎰 JACKPOT! ${a.match3}x ${a.name}s!`,
            };
        }

        // Two matching
        const pair =
            a.name === b.name
                ? a
                : b.name === c.name
                  ? b
                  : a.name === c.name
                    ? a
                    : null;
        if (pair) {
            return {
                winnings: Math.floor(bet * pair.match2),
                multiplier: pair.match2,
                message: `🎊 ${pair.match2}x ${pair.name} pair!`,
            };
        }

        // Special symbols
        const specialCount = [a, b, c].filter((r) => r.special).length;
        if (specialCount) {
            return {
                winnings: Math.floor(bet * (1 + specialCount * 0.5)),
                multiplier: 1 + specialCount * 0.5,
                message: `⭐ ${specialCount} special symbol${specialCount > 1 ? "s" : ""}!`,
            };
        }

        return {
            winnings: 0,
            multiplier: 0,
            message: "💤 Better luck next time!",
        };
    },

    // Optimized weighted symbol selection
    getWeightedSymbol(symbols) {
        let rand = Math.random() * symbols.reduce((s, x) => s + x.weight, 0);
        for (const s of symbols) if ((rand -= s.weight) <= 0) return s;
        return symbols[0];
    },

    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    },
};
