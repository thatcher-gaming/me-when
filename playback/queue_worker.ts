import { Queue } from "./queue";
import { QueueConfig, QueueRequest, QueueRequestCode, QueueResponseCode } from "./queue_support";

let queue = undefined;

onmessage = ({ data: [op, data] }: MessageEvent<QueueRequest>) => {
    switch (op) {
        case QueueRequestCode.Init: {
            queue = new Queue(data as QueueConfig);
            postMessage([QueueResponseCode.BeginInit, {}]);

            break;
        }
        case QueueRequestCode.GetStatus:

    }
}