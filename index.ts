import {
    Client,
    ClientOptions,
    Collection,
    CommandInteraction,
    Events,
    GatewayIntentBits,
    InteractionType,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";
import { promises as fs } from 'fs';
import path from 'path';
import { config } from "./config";

class CoolClient extends Client {
    constructor(opt: ClientOptions) {
        super(opt);
    }

    commands: Collection<string, Command> = new Collection();

    async handle_command(interaction: CommandInteraction) {
        const command_name = interaction.commandName;
        const command = this.commands.get(command_name);

        if (!command) {
            throw `${command_name} is a fake command`;
        }

        try {
            await command.callback(interaction);
        } catch (e) {
            if (interaction.replied || interaction.deferred) {
                // sure this is probably a security concern but also
                // who the fuck wants to check the journal every time something
                // breaks. not me.
                await interaction.followUp({ content: `oh dear!! ${e}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `oh dear!! ${e}`, ephemeral: true });
            }
            throw e
        }
    }

    rest = new REST().setToken(config.token);

    async discord_command_bullshit() {
        try {
            console.info("telling discord about the commands");

            const commands = this.commands.map(o => o.command.toJSON());

            const res = await this.rest.put(
                Routes.applicationGuildCommands(config.client_id, config.guild_id),
                { body: commands }
            );

            console.info(`great success!!`);
        } catch {
            console.error("oh well. was worth a go.");
        }
    }
}

const client = new CoolClient({
    intents: [GatewayIntentBits.Guilds],
}) as CoolClient;

interface Command {
    command: SlashCommandBuilder,
    callback: (interaction: CommandInteraction) => Promise<void>;
}

client.commands = await (async () => {
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

client.once(Events.ClientReady, () => {
    const commands = client.commands!.map(o => o.command.name).join(", ");
    console.log(`Commands loaded: ${commands}`)
});

client.on(Events.InteractionCreate, interaction => {
    try {
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                client.handle_command(interaction);
            default:
                throw "aaah!!!!!!"
        }
    } catch (e) {
        console.warn(e);
    }
});

client.login(config.token);
client.discord_command_bullshit();