export type Segment = {
  start: number;
  end: number;
  text: string;
};

export type TranscribeOptions = {
  file: string;
  modelPath?: string;
  language?: string;
  translate?: boolean;
  threads?: number;
  binaryPath?: string;
};

export type TranscriptionResult = {
  text: string;
  segments: Segment[];
};
