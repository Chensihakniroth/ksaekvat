const { EmbedBuilder } = require("discord.js");
const database = require("../../utils/database.js");
const helpers = require("../../utils/helpers.js");
const config = require("../../config/config.js");

module.exports = {
    name: "pay",
    aliases: ["give"],
    description: "Pay cowoncy to another user",
    usage: "pay <@user> <amount>",
    cooldown: 5000,
    category: "economy",

    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        // Validation
        if (!target) {
            const embed = helpers.createErrorEmbed(
                "Please mention a user to pay!",
            );
            return message.reply({ embeds: [embed] });
        }

        if (target.id === message.author.id) {
            const embed = helpers.createErrorEmbed("You cannot pay yourself!");
            return message.reply({ embeds: [embed] });
        }

        if (target.bot) {
            const embed = helpers.createErrorEmbed("You cannot pay bots!");
            return message.reply({ embeds: [embed] });
        }

        if (isNaN(amount) || amount <= 0) {
            const embed = helpers.createErrorEmbed(
                "Please provide a valid amount to pay!",
            );
            return message.reply({ embeds: [embed] });
        }

        const sender = database.getUser(message.author.id);

        if (sender.cowoncy < amount) {
            const embed = helpers.createErrorEmbed(
                `You don't have enough cowoncy! You need **${helpers.formatNumber(amount)}** ${config.emojis.cowoncy} but only have **${helpers.formatNumber(sender.cowoncy)}** ${config.emojis.cowoncy}`,
            );
            return message.reply({ embeds: [embed] });
        }

        if (amount > 250000) {
            const embed = helpers.createErrorEmbed(
                "You cannot pay more than 250000 cowoncy at once!",
            );
            return message.reply({ embeds: [embed] });
        }

        // Process payment
        const receiver = database.getUser(target.id);

        sender.cowoncy -= amount;
        receiver.cowoncy += amount;

        database.saveUser(sender);
        database.saveUser(receiver);

        const embed = new EmbedBuilder()
            .setTitle("💸 Payment Successful!")
            .setColor(config.colors.success)
            .setDescription(
                `**${message.author.username}** paid **${helpers.formatNumber(amount)}** ${config.emojis.cowoncy} to **${target.username}**!`,
            )
            .addFields(
                {
                    name: `${message.author.username}'s Balance`,
                    value: `${helpers.formatNumber(sender.cowoncy)} ${config.emojis.cowoncy}`,
                    inline: true,
                },
                {
                    name: `${target.username}'s Balance`,
                    value: `${helpers.formatNumber(receiver.cowoncy)} ${config.emojis.cowoncy}`,
                    inline: true,
                },
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};
