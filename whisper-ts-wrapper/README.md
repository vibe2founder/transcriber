# whisper-ts-wrapper

A clean, strongly-typed TypeScript wrapper for OpenAI's Whisper CLI.

This library allows you to easily integrate Whisper's powerful Automatic Speech Recognition (ASR) into your Node.js applications by spawning the `whisper` process and parsing its output.

## Prerequisites

This library is a **wrapper** around the Python Whisper CLI. You must have Python and Whisper installed on your system for it to work.

1. **Install Python 3.8+**
2. **Install ffmpeg** (Required by Whisper)
3. **Install OpenAI Whisper**:

   ```bash
   pip install -U openai-whisper
   ```

   Verify installation by running:
   ```bash
   whisper --help
   ```

## Installation

```bash
npm install whisper-ts-wrapper
```

## Usage

```typescript
import { transcribe } from "whisper-ts-wrapper";

async function main() {
  try {
    const result = await transcribe({
      file: "audio.mp3",
      model: "base",      // optional: "tiny" | "base" | "small" | "medium" | "large" | "turbo"
      language: "pt",     // optional: auto-detect if not specified
      translate: false    // optional: set to true to translate to English
    });

    console.log("Full Text:", result.text);

    console.log("Segments:");
    result.segments.forEach(segment => {
      console.log(`[${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s]: ${segment.text}`);
    });

  } catch (error) {
    console.error("Transcription failed:", error);
  }
}

main();
```

## API

### `transcribe(options: TranscribeOptions): Promise<TranscribeResult>`

#### `TranscribeOptions`

| Property | Type | Description |
|----------|------|-------------|
| `file` | `string` | Path to the audio file. **Required**. |
| `model` | `string` | Whisper model to use (`tiny`, `base`, `small`, `medium`, `large`, `turbo`). Default is determined by Whisper CLI (usually `small` or `turbo`). |
| `language` | `string` | Language code (e.g., `en`, `pt`, `ja`). If omitted, Whisper auto-detects. |
| `translate` | `boolean` | If `true`, translates the audio to English (`--task translate`). |

#### `TranscribeResult`

| Property | Type | Description |
|----------|------|-------------|
| `text` | `string` | The full transcribed text. |
| `segments` | `Segment[]` | Array of segments with timestamps. |

#### `Segment`

```typescript
{
  start: number; // Start time in seconds
  end: number;   // End time in seconds
  text: string;  // Text content of the segment
}
```

## Features

- **Type-safe**: Full TypeScript support.
- **Zero-dependency**: Uses only standard Node.js modules (`child_process`, `fs`, `path`, `os`).
- **Clean**: Handles temporary file creation and cleanup automatically.
- **Error Handling**: Friendly errors if Whisper is not installed or fails.
