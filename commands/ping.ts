import { CommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("commence the pinging");

const callback = async (interaction: CommandInteraction) => {
    interaction.reply("hello");
}

export { callback, command };
