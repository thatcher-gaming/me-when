import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { promises as fs } from "fs";
import path from "path";

export interface Command {
    command: SlashCommandBuilder;
    callback: (interaction: CommandInteraction) => Promise<void>;
}

export const commands = await (async () => {
    const collection = new Collection<string, Command>();

    const cmd_path = path.join(__dirname, 'commands');
    const cmd_files = (await fs.readdir(cmd_path)).filter(file => file.endsWith("ts"));

    for (const file of cmd_files) {
        const file_path = path.join(cmd_path, file);
        const mod = await import(file_path) as Command;

        if ('command' in mod && 'callback' in mod) {
            collection.set(mod.command.name, mod);
        }
    }

    return collection;
})();
