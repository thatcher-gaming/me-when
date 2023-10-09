import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import ytdl from "ytdl-core";

const yoink = (s: string, prefix: string, suffix: string) =>
  s.split(prefix)[1].split(suffix)[0];

export const getReplayGain = async (
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

export const fetchAudioProxy = async (url: string, fname: string) => {
  const info = await ytdl.getInfo(url);
  const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
  const format = ytdl.chooseFormat(audioFormats, { quality: "lowestaudio" });
  console.log(format.container);

  const options: ytdl.downloadOptions = {
    format: format,
    range: { start: 0, end: 7 * 60 * 1000 },
  };
  return ytdl(url, options).pipe(fs.createWriteStream(fname));
};

export const dbToRatio = (dbVal: number) => Math.pow(10, dbVal / 20);
