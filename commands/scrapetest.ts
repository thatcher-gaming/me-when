import {
    ChannelType,
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandChannelOption
} from "discord.js";
import { scrape_the_thread } from "../stuff/threads";
import { CoolClient } from "../client";

const chan_opt = new SlashCommandChannelOption()
    .setName("thread")
    .setDescription("the thread")
    .addChannelTypes(ChannelType.PublicThread)
    .setRequired(true);

const command = new SlashCommandBuilder()
    .setName("scrape-test")
    .setDescription("try and scrape a thread")
    .addChannelOption(chan_opt);

const callback = async (interaction: CommandInteraction) => {
    const thread = interaction.options.get(chan_opt.name, true);
    const scraped = await scrape_the_thread(interaction.client as CoolClient, thread.channel!.id);

    console.log(scraped);

    if (Object.values(scraped).length == 0) {
        interaction.reply("couldn't find anything");
    }

    const response = Object.keys(scraped).reduce((prev, obj) => {
        prev = prev + `**Round ${obj}\n**`;

        const msgs = scraped[Number(obj)];
        Object.values(msgs).forEach(o => {
            prev = prev + o.url + "\n";
        });

        return prev;
    }, "");

    interaction.reply(response);
}

export { callback, command };
