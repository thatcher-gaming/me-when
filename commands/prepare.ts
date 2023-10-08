import {
    ChannelType,
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandChannelOption
} from "discord.js";
import { outdent } from "outdent";
import { scrape_the_thread } from "../stuff/threads";
import { CoolClient } from "../client";

const chan_opt = new SlashCommandChannelOption()
    .setName("thread")
    .setDescription("the thread to read the stuff from")
    .addChannelTypes(ChannelType.PublicThread)
    .setRequired(true);

const stage_opt = new SlashCommandChannelOption()
    .setName("stage")
    .setDescription("the stage to play the music in")
    .addChannelTypes(ChannelType.GuildStageVoice)
    .setRequired(true);

const command = new SlashCommandBuilder()
    .setName("prepare")
    .setDescription("arm the bot for a phone show")
    .addChannelOption(chan_opt)
    .addChannelOption(stage_opt);

const callback = async (interaction: CommandInteraction) => {
    const thread = interaction.options.get(chan_opt.name, true).channel!;
    const stage = interaction.options.get(stage_opt.name, true).channel!;
    const scraped = await scrape_the_thread(interaction.client as CoolClient, thread.id);

    const round_count = Object.keys(scraped).length;
    const song_count = Object.values(scraped).flatMap(o => Object.values(o)).length;

    interaction.reply(outdent`
        # bot is now armed and dangerous
        downloading ${song_count} songs from ${
        round_count} rounds and listening out for new stuff in <#${
        thread.id}>. you can see how that's going with /check. 
        
        remember to end the show with /finish when you're done.
        updates will be sent to this channel if needs be.
    `);
}

export { command, callback }
