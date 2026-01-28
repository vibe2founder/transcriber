# ts-whisper

A clean, strongly-typed TypeScript wrapper for the [OpenAI Whisper](https://github.com/openai/whisper) CLI.
This library allows you to easily transcribe audio files from your Node.js applications using the powerful Whisper models.

## Features

*   **Simple API**: Just call `transcribe` with your options.
*   **TypeScript Support**: Fully typed interfaces for inputs and outputs.
*   **Promise-based**: Uses `async/await` for asynchronous execution.
*   **No Heavy Dependencies**: Acts as a bridge to the installed system Whisper CLI.

## Prerequisites

You must have **Python** and **OpenAI Whisper** installed on your system.

To install Whisper:
```bash
pip install -U openai-whisper
```
You also need `ffmpeg` installed on your system.

## Installation

```bash
npm install ts-whisper
```

## Usage

```typescript
import { transcribe, checkWhisperInstalled } from "ts-whisper";

async function main() {
  // Optional: Check if whisper is available
  const isInstalled = await checkWhisperInstalled();
  if (!isInstalled) {
    console.error("Whisper CLI is not installed.");
    return;
  }

  try {
    const result = await transcribe({
      file: "audio.mp3",
      model: "base",      // optional: "tiny" | "base" | "small" | "medium" | "large" | "turbo"
      language: "en",     // optional
      translate: false,   // optional: translate to English
    });

    console.log("Full Text:", result.text);
    console.log("Segments:", result.segments);
  } catch (error) {
    console.error("Transcription failed:", error);
  }
}

main();
```

## API

### `transcribe(options: IWhisperOptions): Promise<ITranscribeResult>`

**Options:**

*   `file` (string): Path to the audio file.
*   `model` (string, optional): Model size (`tiny`, `base`, `small`, `medium`, `large`, `turbo`).
*   `language` (string, optional): Language of the audio (e.g., "en", "pt", "es").
*   `translate` (boolean, optional): If true, translates the result to English.

**Returns:**

A Promise resolving to an object:

*   `text` (string): The complete transcribed text.
*   `segments` (Array): List of segments with `start`, `end`, and `text`.

### `checkWhisperInstalled(): Promise<boolean>`

Checks if the `whisper` command is available in the system PATH.

## License

MIT
