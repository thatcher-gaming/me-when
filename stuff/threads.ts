import { Message } from "discord.js";
import { CoolClient } from "../client";
import * as linkify from 'linkifyjs';

export interface ParsedMessage {
    url: string,
    message: Message,
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
    msgs.reverse()

    let top_post = true;
    const parsed = msgs.reduce((prev, message) => {
        if (top_post) {
            top_post = false;
            return prev;
        }

        let round;

        // figure out which round we're inserting into
        // the old version of this had 3 layers of recursion
        // so consider yourself lucky
        let index = 1;
        while (!round) {
            if (index > 4) {
                throw "recursed too hard. worst mistake of my life";
            }

            const r = prev[index];
    
            // insert a new round if there isn't one
            if (!r) {
                round = {};
                break;
            }
    
            // if the user already has a song for this round, go again.
            if (r[message.author.id]) {
                index++;
            } else {
                round = r;
            }
        }

        const [res] = linkify.find(message.content) ?? [];
        if (!res) {
            return prev;
        }

        // remove discord spoiler notation
        const url = res.href.replaceAll("||", "");

        const parsed: ParsedMessage = {
            url,
            message,
        }

        round[message.author.id] = parsed;
        prev[index] = round;

        return prev;
    }, <{[round: number]: { [id: string]: ParsedMessage }}>{});

    return parsed;
}