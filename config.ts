import { promises as fs } from "fs";
import { z } from "zod";
import { TOML } from "bun";

const config_file = "bot.toml"

export const config_schema = z.object({
    token: z.string(),
    client_id: z.string(),
    guild_id: z.string(),
});

export type Config = z.infer<typeof config_schema>;

const config_raw = await fs.readFile(config_file, { encoding: "utf-8" });
const parsed = TOML.parse(config_raw);
export const config = await config_schema.parseAsync(parsed);


