import { CoolClient } from "../client";

export interface ParsedMessage {
    // todo
}

export async function scrape_the_thread(client: CoolClient, chan_id: string) {
    const channel = await client.channels.fetch(chan_id);

    if (!channel) {
        throw "not a real channel";
    }

    if (!channel.isThread()) {
        throw "not a thread";
    }

    const msgs = await channel.messages.fetch();

    throw "todo"
}