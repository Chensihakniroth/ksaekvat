const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.js");
const helpers = require("../../utils/helpers.js");

// GIF URLs for each action type - using Giphy and more reliable sources
const gifs = {
    slap: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng4bndtNmdrMXB1NXJtYmV6aGY5cThtcmo5cm5peGJmdjM5bGl1aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/u8maN0dMhVWPS/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng4bndtNmdrMXB1NXJtYmV6aGY5cThtcmo5cm5peGJmdjM5bGl1aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/rCftUAVPLExZC/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdng4bndtNmdrMXB1NXJtYmV6aGY5cThtcmo5cm5peGJmdjM5bGl1aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uqSU9IEYEKAbS/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MjM4aTlxbXRoNTY1cnJmMXQ4bjlhaGVpemhoOWhhemc1Z2E5emw3cSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/RXGNsyRb1hDJm/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bDFkOW15ZWxheXRybTRtazhqM2J6MzVuZTB0dTRjY3drNHRpMG9scyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qNtqBSTTwXyuI/giphy.gif",
    ],
    kill: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGljMmp5aWNhdDVrbTV4aXN6dG4zMngzam9xY3BuZ21kb250Y3MwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1xONKAmjT1GHFpkLRd/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGljMmp5aWNhdDVrbTV4aXN6dG4zMngzam9xY3BuZ21kb250Y3MwZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wiaoWlW17fqIo/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bXMxOHY1bnJydTJ0dmp2YjBoazNoOWhwNDUwOW1sajA0ajBjYzVheiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/zAtjMmiiQLMtO/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZTN6dm14bnpldGdnNnd2Yjk4d3F2OWlnbjl2dmVtbHYyZjhobWl1ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1mhlbUDAVlQD4E32ZZ/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NmUyMzIzaTZpbTZrNjl3enNzeWJienV6ODNoYjNoZTNzbzRrd3R1eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NY3tXwOBUwQYq7lbXx/giphy.gif",
    ],
    fuck: [
        "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
        "https://media.giphy.com/media/E4Rl48Wybem3u/giphy.gif",
        "https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif",
        "https://media.giphy.com/media/3oriNYQX2lC6dfW2Ji/giphy.gif",
        "https://media.giphy.com/media/4Zd0XJxy5Qirm/giphy.gif",
    ],
    kiss: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWY2MW45aDdwNnJ4a2lneXJqcHp3MWhqc2wyZnBhdXQycjJxbWZ6OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/G3va31oEEnIkM/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWY2MW45aDdwNnJ4a2lneXJqcHp3MWhqc2wyZnBhdXQycjJxbWZ6OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MQVpBqASxSlFu/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWY2MW45aDdwNnJ4a2lneXJqcHp3MWhqc2wyZnBhdXQycjJxbWZ6OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/zkppEMFvRX5FC/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d2h4bXZ6OWY2ODJpbXl2eHpxMG84Y2hwZ2hnMnpmdHllcjhoOGM1OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/flmwfIpFVrSKI/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cXJjYjUwdTZpMmo4aDM2YzJpMmV1amFpbzI4cXAxZHZ4YmU4MGg3NyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/kU586ictpGb0Q/giphy.gif",
    ],
    lick: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTNxb2ZleDZtOG1tYWxocTVteTZoNW52c3l6dWpyZ3BleHJsdHQwayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8GiREm7aqMwN2/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTNxb2ZleDZtOG1tYWxocTVteTZoNW52c3l6dWpyZ3BleHJsdHQwayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZnnHMeC7iDSzC/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3N3hoMnh5ejdtc2h2OWY4NWtnMTBlYmpwd2Vqa2VtajF6YzI2M2w1dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DTbmKtrYbwUkw1Inyv/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3b3B4ampvczMzMTRtODBlOWJwMzFuOXRwOTB1a3lkamU4MWJxOHBtNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/W35ryt1xNsz2vGLAND/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExem55emkxYjFnOWg0dXBnczJoOGYzZThxcjZ0d2Y3ZW16YnVrdWQzYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YqQt3rkzFXbREtTURJ/giphy.gif",
    ],
    kick: [
        "https://tenor.com/en-GB/view/gintama-anime-katsura-kick-kicking-gif-16927960988617415460",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDY1cm1mN21oeWE1N3RuMTE0cXB1bHhvbnJkczRzc2wzdmkwNHIzayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/u2LJ0n4lx6jF6/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dnQybmFnenFjc2tmNnhqdmpucWFzMTY4MHRqdmJ4bnN2ZjA3bjVncyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT1XGPOiwuDNB7dYVq/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dnQybmFnenFjc2tmNnhqdmpucWFzMTY4MHRqdmJ4bnN2ZjA3bjVncyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KmG26GNmdWOUE/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OGFvbHg4ZGthejV2bG1tOXI2NThnZGRyN3hleWg2M3BxbXFidzg4YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KMCeCOHjE8uaNEso0l/giphy.gif",
    ],
    spank: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3NncTBvMXJoMWtxOWN4cDlhbzU4ZGRtbzl3aDU4eDBwNzgyMGtwZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6BZaFXBVPBtok/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3NncTBvMXJoMWtxOWN4cDlhbzU4ZGRtbzl3aDU4eDBwNzgyMGtwZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OWCdX4sTNt1frLfydK/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OHh6dGJ2aWZ5MjF2Y2Q4aXE2aHplN3ZjZDB3YndrcXM3bzVwc2NwNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/x02ILqNsHm4s04cVxg/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OHh6dGJ2aWZ5MjF2Y2Q4aXE2aHplN3ZjZDB3YndrcXM3bzVwc2NwNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mTouKiKZDdj6XW3pge/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eXI3bjY2N2R6dDViZGY5b2E3d2tpcTJ5Y2MyNGt1NjRtbHkxcjkyZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M6UW6Q8OiJAFDv8sRf/giphy.gif",
    ],
    hug: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDk4ZDM5MmYwNzhmZDd4eWRwcGVqY3N3cTM4ZTk2NmxzbHZjNzRwYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3bqtLDeiDtwhq/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTQza3NuMWVvdnppNnpoc2NtejNqeXdnb2FiZHRxbDl2bjNmZDhwYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JLovyTOWK4cuc/giphy.gif",
        "https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYndoNmRpNWlxcnhoZW1zYWQ1b2plbDRubXI5bHJxMnR2aDhmOXBlayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/2Sfk8j7DPc997mnXXu/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWI5Y2lnNTMxam5kamloc3MxZ3NvbWpodmJteHZsMXI0Y3I4ZWsyOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/16bJmyPvRbCDu/giphy.gif",
    ],
    cuddle: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGdieDlub3F6dmlkc3R2aHppaGVqdDlvY2txYXF5enZpN3NmOW00OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3rgXBSoIApjSYTo8vK/giphy.gif", // Sweet anime cuddle
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGdieDlub3F6dmlkc3R2aHppaGVqdDlvY2txYXF5enZpN3NmOW00OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/131Q2gKssUNCwM/giphy.gif", // Blushing couple cuddle
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGdieDlub3F6dmlkc3R2aHppaGVqdDlvY2txYXF5enZpN3NmOW00OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/AVDSRfk3vhR0bBmaoV/giphy.gif", // Sleepy cuddle
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa25qeTJiZ3QzaWEycno3d3JyMHFuY2xpNmU5dHBvYzQzMmxvM3ZxbSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qei7zeYhBu3zW/giphy.gif", // Warm hug & cuddle
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa25qeTJiZ3QzaWEycno3d3JyMHFuY2xpNmU5dHBvYzQzMmxvM3ZxbSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LVXJQat47MwQU/giphy.gif", // Romantic anime cuddle
    ],

    pat: [
        "https://media.giphy.com/media/KztT2c4u8mYYUiMKdJ/giphy.gif",
        "https://media.giphy.com/media/3o6ZtjUZAi3zaezAf6/giphy.gif",
        "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif",
        "https://media.giphy.com/media/L4HjAdI4NUqPu/giphy.gif",
        "https://media.giphy.com/media/FTGah7Mx3ss04PcasF/giphy.gif",
    ],

    poke: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGc4bTUwMnY2b3dnYzlyaG5zcWVpemtmMWZpOWgyNWM3bTZlMXhmNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PkR8gPgc2mDlrMSgtu/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGc4bTUwMnY2b3dnYzlyaG5zcWVpemtmMWZpOWgyNWM3bTZlMXhmNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Vfie0DJryAde8/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHU3djNxN3B1NzlkM3JidjhhNWlpd2o1NWtpc2k1cWIzNzBobTJiMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/aZSMD7CpgU4Za/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHU3djNxN3B1NzlkM3JidjhhNWlpd2o1NWtpc2k1cWIzNzBobTJiMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1gQwMNJ9z1mqABgQd3/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eXR2b2J3MmR3M3FhMHIwMHloaWZmbmQ2Y2l6cGtib2VraTg2djdiaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NwCA5FZlzujLwj8gbH/giphy.gif",
    ],

    blush: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGU0NTd2dGp0Zm1ocjE4dG81ejNpbzE2enp1emJ4bWpxYjA1aWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QIXDNqdHT6aQw/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGU0NTd2dGp0Zm1ocjE4dG81ejNpbzE2enp1emJ4bWpxYjA1aWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DxqLrg8cINwnS/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGU0NTd2dGp0Zm1ocjE4dG81ejNpbzE2enp1emJ4bWpxYjA1aWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OpfkuToK5gSHK/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGU0NTd2dGp0Zm1ocjE4dG81ejNpbzE2enp1emJ4bWpxYjA1aWh0cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bMLGNRoAy0Yko/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3c2FmYmI3cjhlZGt1MmluNHFlNHVvdmJ1ZGNmN3EzZ203emttMHBrZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mbknOowlCMw5v3J6cm/giphy.gif",
    ],

    jail: [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmVlZzdjZHFnd2Zoc3JubDI0Ynl4bzQ0cGVlZDVua2s4OWpvd2oxZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/09dV176CAvWzSv2bKq/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTZva2N4OTZxNTk1NDlpYTVkd2w5c3F6dGl0MHNrZHpiMnlpcGdlZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/d7kSG1nIJ4CDt9TR6m/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MXlzYmJ0eGh0a3BxODl2dnlxd2dqNDZ5OHNma2hkd2ttc2RmdHBmNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/z7XT9h0GIGTnPC6PDP/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjZ0amUyZ2h5aWc3ajF5NXc3MmFtM25vaHZra3o5bXBhYXV4b2xxdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8373F7z8uD1EmbufL8/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjZ0amUyZ2h5aWc3ajF5NXc3MmFtM25vaHZra3o5bXBhYXV4b2xxdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/P2xf5nPyu5WP6/giphy.gif",
    ],
};

// Action descriptions for each type
const actionDescriptions = {
    slap: ["slapped", "👋", "Ouch! That must have hurt!"],
    kill: ["killed", "💀", "RIP! They had a good run!"],
    fuck: [
        "is getting intimate with",
        "💕",
        "Oh my! Things are getting spicy!",
    ],
    kiss: ["kissed", "💋", "Aww! How romantic!"],
    lick: ["licked", "👅", "That's... interesting!"],
    kick: ["kicked", "🦵", "Ooof! Right in the shins!"],
    spank: ["spanked", "🍑", "Naughty! Someone's been bad!"],
    hug: ["hugged", "🤗", "So warm and comforting!"],
    cuddle: ["cuddled with", "🥰", "Aww! So cozy and sweet!"],
    pat: ["patted", "🤲", "Good job! You deserve headpats!"],
    poke: ["poked", "👆", "Poke poke! Getting their attention!"],
    tickle: ["tickled", "😄", "Hehe! That's ticklish!"],
    bite: ["bit", "🦷", "Nom nom! A playful bite!"],
    blush: ["made", "😊", "So embarrassing but cute!"],
    smile: ["smiled at", "😄", "Such a beautiful smile!"],
    wave: ["waved at", "👋", "Hello there! Friendly greeting!"],
    dance: ["danced with", "💃", "Let's boogie! Dance party time!"],
    jail: ["sent to jail", "🚔", "You're going to jail! Crime doesn't pay!"],
    marry: ["married", "💒", "You may now kiss! Happily ever after!"],
    divorce: ["divorced", "💔", "It's complicated... Time to move on!"],
};

module.exports = {
    name: "social",
    aliases: [
        "slap",
        "kill",
        "fuck",
        "kiss",
        "lick",
        "kick",
        "spank",
        "jail",
        "marry",
        "divorce",
        "hug",
        "cuddle",
        "pat",
        "poke",
        "tickle",
        "bite",
        "blush",
        "smile",
        "wave",
        "dance",
    ],
    description: "Send fun GIF interactions to other users",
    usage: "<action> @user",
    cooldown: 3000,
    category: "general",

    async execute(message, args, client, commandName) {
        // Determine which action was used
        const action = commandName.toLowerCase();

        // Check if this is a valid social action
        if (!gifs[action]) {
            return; // Not a social command
        }

        // Get target user from mentions or args
        let target = null;

        if (message.mentions.users.size > 0) {
            target = message.mentions.users.first();
        } else if (args[0]) {
            // Try to get user by ID or username
            const userArg = args[0].replace(/[<@!>]/g, "");
            target = await client.users.fetch(userArg).catch(() => null);

            if (!target) {
                // Try to find by username in guild
                const member = message.guild?.members.cache.find(
                    (m) =>
                        m.user.username
                            .toLowerCase()
                            .includes(userArg.toLowerCase()) ||
                        m.displayName
                            .toLowerCase()
                            .includes(userArg.toLowerCase()),
                );
                target = member?.user;
            }
        }

        if (!target) {
            const embed = helpers.createErrorEmbed(
                `Please mention a user to ${action}!\n\n` +
                    `**Example:** \`${config.prefix}${action} @username\``,
            );
            return message.reply({ embeds: [embed] });
        }

        // Prevent self-targeting for certain actions
        if (target.id === message.author.id) {
            const selfActionMessages = {
                slap: "You slap yourself! That's... concerning.",
                kill: "You can't kill yourself! Seek help if you need it.",
                fuck: "That's a bit lonely, don't you think?",
                kiss: "You kiss yourself in the mirror. Self-love!",
                lick: "You lick yourself like a cat. Weird but okay.",
                kick: "You kick yourself. Why would you do that?",
                spank: "You spank yourself. That's... personal.",
                hug: "You hug yourself! Self-care is important!",
                cuddle: "You cuddle with a pillow. So cozy!",
                pat: "You pat yourself on the back. Good job!",
                poke: "You poke yourself. Why though?",
                tickle: "You tickle yourself. That's... not how it works.",
                bite: "You bite yourself. Ouch! That hurts!",
                blush: "You blush at yourself in the mirror. Cute!",
                smile: "You smile at yourself. Confidence is key!",
                wave: "You wave at yourself. Hello me!",
                dance: "You dance alone! Solo dance party!",
                jail: "You can't arrest yourself! That's not legal!",
                marry: "You can't marry yourself... yet!",
                divorce: "You can't divorce yourself! That's not how it works!",
            };

            const embed = new EmbedBuilder()
                .setTitle(`${actionDescriptions[action][1]} Self-${action}!`)
                .setDescription(selfActionMessages[action])
                .setColor(config.colors.warning);

            return message.reply({ embeds: [embed] });
        }

        // Prevent targeting bots for certain actions
        if (
            target.bot &&
            ["fuck", "kiss", "lick", "spank", "marry"].includes(action)
        ) {
            const embed = helpers.createErrorEmbed(
                `You can't ${action} a bot! They don't have feelings... yet.`,
            );
            return message.reply({ embeds: [embed] });
        }

        // Get random GIF for the action
        const randomGif = helpers.getRandomElement(gifs[action]);
        const [actionVerb, emoji, flavorText] = actionDescriptions[action];

        // Special handling for certain actions
        let descriptionText = `**${message.author.username}** ${actionVerb} **${target.username}**!\n\n*${flavorText}*`;

        // Special cases for actions that need different grammar
        if (action === "blush") {
            descriptionText = `**${target.username}** ${actionVerb} **${message.author.username}** blush!\n\n*${flavorText}*`;
        }

        // Create embed with GIF
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${action.toUpperCase()}!`)
            .setDescription(descriptionText)
            .setImage(randomGif)
            .setColor(config.colors.primary)
            .setFooter({
                text: `Use ${config.prefix}${action} @user to ${action} someone!`,
            })
            .setTimestamp();

        // Add special colors for different action types
        if (["kill", "slap", "kick", "jail", "divorce"].includes(action)) {
            embed.setColor(config.colors.error);
        } else if (
            ["kiss", "fuck", "lick", "marry", "cuddle"].includes(action)
        ) {
            embed.setColor("#ff69b4"); // Pink for romantic actions
        } else if (["hug", "pat", "smile", "wave"].includes(action)) {
            embed.setColor("#00ff00"); // Green for friendly actions
        } else if (["dance", "tickle", "poke"].includes(action)) {
            embed.setColor("#ffff00"); // Yellow for fun actions
        }

        // Send the embed
        const response = await message.reply({ embeds: [embed] });

        // Add reactions for fun
        const reactions = {
            slap: ["👋", "😵"],
            kill: ["💀", "⚰️"],
            fuck: ["💕", "😏"],
            kiss: ["💋", "😘"],
            lick: ["👅", "😋"],
            kick: ["🦵", "😵"],
            spank: ["🍑", "😳"],
            hug: ["🤗", "❤️"],
            cuddle: ["🥰", "💕"],
            pat: ["🤲", "😊"],
            poke: ["👆", "😄"],
            tickle: ["😄", "🤣"],
            bite: ["🦷", "😋"],
            blush: ["😊", "😳"],
            smile: ["😄", "😊"],
            wave: ["👋", "😊"],
            dance: ["💃", "🕺"],
            jail: ["🚔", "⛓️"],
            marry: ["💒", "💍"],
            divorce: ["💔", "📜"],
        };

        // Uncomment if you want to add reactions
        // if (reactions[action]) {
        //     for (const reaction of reactions[action]) {
        //         await response.react(reaction).catch(() => {});
        //     }
        // }
    },
};
