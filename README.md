# whisper-cpp-ts

`whisper-cpp-ts` is a TypeScript library that wraps the `whisper.cpp` CLI so you can run local speech-to-text transcription from Node.js.

## Requirements

- A compiled `whisper.cpp` binary placed at `bin/whisper` (or `bin/whisper.exe` on Windows).
- A model file such as `ggml-base.bin` placed at `models/ggml-base.bin`.

You can download models from the official `whisper.cpp` releases or build them following the instructions in the upstream repository.

## Usage

```ts
import { transcribe } from "ts-whisper";

const result = await transcribe({
  file: "audio.wav",
  language: "pt",
});

console.log(result.text);
```

## Options

- `modelPath`: Override the model file path. Defaults to `models/ggml-base.bin`.
- `threads`: Set the number of CPU threads to use with `whisper.cpp`.
- `translate`: When true, `whisper.cpp` will translate speech to English.

## Binary and model helpers

- `checkWhisperBinary()` verifies the binary exists and returns the resolved path.
- `checkModel()` verifies the model exists and returns the resolved path.

## Notes

This library only orchestrates the `whisper.cpp` CLI and does not reimplement any Whisper inference.
