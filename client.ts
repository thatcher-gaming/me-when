import {
    Client,
    ClientOptions,
    Collection,
    CommandInteraction,
    Events,
    InteractionType,
    REST,
    Routes,
} from "discord.js";
import { Command, commands } from "./commands";
import { config } from "./config";
import { QueueConfig, QueueRequest, QueueRequestCode, QueueResponse, QueueResponseCode } from "./playback/queue_support";
import { scrape_the_thread } from "./stuff/threads";

export class CoolClient extends Client {
    constructor(opt: ClientOptions) {
        super(opt);

        this.once(Events.ClientReady, () => {
            const commands = this.commands!.map(o => o.command.name).join(", ");
            console.log(`Commands loaded: ${commands}`)
        });

        this.on(Events.InteractionCreate, interaction => {
            try {
                switch (interaction.type) {
                    case InteractionType.ApplicationCommand:
                        this.handle_command(interaction);
                    default:
                        throw "aaah!!!!!!"
                }
            } catch (e) {
                console.warn(e);
            }
        });
    }

    commands: Collection<string, Command> = commands;

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
            throw e;
        }
    }

    rest = new REST().setToken(config.token);

    async do_discord_command_bullshit() {
        try {
            console.info("telling discord about the commands");

            const commands = this.commands.map(o => o.command.toJSON());

            await this.rest.put(
                Routes.applicationGuildCommands(config.client_id, config.guild_id),
                { body: commands }
            );

            console.info(`great success!!`);
        } catch {
            console.error("oh well. was worth a go.");
        }
    }

    current_queue: QueueConfig | undefined;
    queue_worker: Worker | undefined;

    async create_queue(sys_channel_id: string, thread_id: string, stage_id: string,) {
        this.queue_worker = new Worker(
            "./playback/queue_worker.ts",
            { type: "module" }
        );

        this.queue_worker.addEventListener("message", this.handle_queue_msg);

        const scraped = await scrape_the_thread(this, thread_id);
        const qconfig = {
            guild_id: config.guild_id,
            sys_channel_id,
            stage_id,
            thread: scraped,
        };
        this.current_queue = qconfig;

        this.queue_worker.postMessage([QueueRequestCode.Init, qconfig] as QueueRequest);
    }

    async handle_queue_msg(event: MessageEvent) {
        const [op, data] = event.data as QueueResponse;

        switch (op) {
            case QueueResponseCode.BeginInit:
        }
    }
}