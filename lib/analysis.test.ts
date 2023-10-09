import { describe, expect, it } from "vitest";
import { dbToRatio, fetchAudioProxy, getReplayGain } from "./analysis";

const testFile = "./testdata/test.wav";

const testUrl = "https://www.youtube.com/watch?v=QLlyd1syVkw";
const testUrlFile = "cache/starlight.webm";

describe("getReplayGain", () => {
  it("throws an error on invalid filenames", async () => {
    const gainVals = getReplayGain("asdf");
    expect(gainVals).rejects.toThrowError("File not found");
  });

  it("can analyze an audio file", async () => {
    const joeRogaine = await getReplayGain(testFile);
    expect(joeRogaine).toEqual({ gain: -2.97, peak: 0.831757 });
  });
});

describe("fetchAudioProxy", () => {
  it("throws an error on invalid URL", () => {
    const proxy = fetchAudioProxy("http://BLARGH", "nope.webm");
    expect(proxy).rejects.toThrowError("Not a YouTube domain");
  });

  it("can fetch a proxy", () => {
    const proxy = fetchAudioProxy(testUrl, testUrlFile);
    expect(proxy).not.toBeUndefined();
  });
});

describe("why not both", () => {
  it("can download and analyze a file", async () => {
    const proxy = fetchAudioProxy(testUrl, testUrlFile);
    const rg = await getReplayGain(testUrlFile);
    expect(rg).toEqual({ gain: -6.43, peak: 1.104515 });
  });
});

describe("dbToRatio", () => {
  it("returns ~0.5 for -6 dB", () => {
    expect(dbToRatio(-6)).toEqual(0.5011872336272722);
  });
});
