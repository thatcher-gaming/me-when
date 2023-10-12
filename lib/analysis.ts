import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const yoink = (s: string, prefix: string, suffix: string) =>
  s.split(prefix)[1].split(suffix)[0];

export const get_replay_gain = async (
  fp: string
): Promise<{ gain: number; peak: number }> => {
  if (!fs.existsSync(fp)) {
    throw Error("File not found");
  }
  const gainVals = { gain: 0, peak: 0 };

  return new Promise((resolve, reject) => {
    const f = ffmpeg(fp)
      .on("stderr", (line: string) => {
        if (line.includes("track_gain")) {
          gainVals.gain = Number(yoink(line, "track_gain = ", " dB"));
        }
        if (line.includes("track_peak")) {
          gainVals.peak = Number(yoink(line, "track_peak = ", " "));
        }
      })
      .on("end", () => {
        resolve(gainVals);
      })
      .on("error", (line) => {
        return reject(new Error(line));
      });

    f.audioFilters("replaygain");
    f.format("null");
    f.output("/dev/null");
    f.run();
  });
};

export const fetch_audio_proxy = async (url: string, fname: string) => {
  const args = [
    url,
    `-f wa`,
    `--download-sections "*00:00:00-00:07:00"`,
    `-o ${fname}`,
  ];

  return new Promise<string>((resolve, reject) => {
    exec(`yt-dlp ${args.join(" ")}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(fname);
      }
    });
  });
};

export const db_to_ratio = (dbVal: number) => Math.pow(10, dbVal / 20);
