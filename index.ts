import { GatewayIntentBits } from "discord.js";
import { CoolClient } from "./client";
import { config } from "./config";

export const client = new CoolClient({
    intents: [GatewayIntentBits.Guilds],
});

client.login(config.token);
client.do_discord_command_bullshit();