import { describe, expect, it } from "vitest";
import { db_to_ratio, fetch_audio_proxy, get_replay_gain } from "./analysis";

const testFile = "./testdata/test.wav";

const testUrl = "https://www.youtube.com/watch?v=QLlyd1syVkw";
const testUrlFile = "cache/starlight.webm";

describe("getReplayGain", () => {
  it("throws an error on invalid filenames", async () => {
    const gainVals = get_replay_gain("asdf");
    expect(gainVals).rejects.toThrowError("File not found");
  });

  it("can analyze an audio file", async () => {
    const joeRogaine = await get_replay_gain(testFile);
    expect(joeRogaine).toEqual({ gain: -2.97, peak: 0.831757 });
  });
});

describe("fetchAudioProxy", () => {
  it("throws an error on invalid URL", () => {
    const proxy = fetch_audio_proxy("http://BLARGH", "nope.webm");
    expect(proxy).rejects.toThrowError("Not a YouTube domain");
  });

  it("can fetch a proxy", () => {
    const proxy = fetch_audio_proxy(testUrl, testUrlFile);
    expect(proxy).not.toBeUndefined();
  });
});

describe("why not both", () => {
  it("can download and analyze a file", async () => {
    const proxy = fetch_audio_proxy(testUrl, testUrlFile);
    const rg = await get_replay_gain(testUrlFile);
    expect(rg).toEqual({ gain: -6.43, peak: 1.104515 });
  });
});

describe("dbToRatio", () => {
  it("returns ~0.5 for -6 dB", () => {
    expect(db_to_ratio(-6)).toEqual(0.5011872336272722);
  });
});
