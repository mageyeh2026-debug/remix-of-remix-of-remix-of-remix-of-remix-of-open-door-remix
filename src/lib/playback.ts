export type PlaybackKind = "mp4" | "dash" | "hls" | "drive";

export type PlaybackSource = {
  url: string;
  type: PlaybackKind;
};