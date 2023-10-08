import { ParsedThread } from "../stuff/threads";

export interface QueueConfig {
    guild_id: string,
    sys_channel_id: string,
    stage_id: string,
    thread: ParsedThread,
}

export enum QueueResponseCode {
    BeginInit,
    DoneInit,
    Status,

    ErrNoQueue,
}

// i miss rust
export type QueueResponse = (
    | [QueueResponseCode.BeginInit, null]
    | [QueueResponseCode.DoneInit, { mishaps: string[] }]
    | [QueueResponseCode.Status, {
        pending_count: number,
        in_progress: number,
        done: number,
        mishaps: string[],
    }]
);

export enum QueueRequestCode {
    Init,
    GetStatus,
}

export type QueueRequest = (
    | [QueueRequestCode.Init, QueueConfig]
    | [QueueRequestCode.GetStatus, null]
);