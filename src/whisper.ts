import { spawn } from "child_process";
import { TranscribeOptions, TranscriptionResult } from "./types";
import { assertFileExists, checkModel, checkWhisperBinary, sanitizePath } from "./utils";

const parseWhisperJson = (rawOutput: string): TranscriptionResult => {
  const trimmed = rawOutput.trim();
  if (!trimmed) {
    throw new Error("Whisper returned empty output");
  }

  const startIndex = trimmed.indexOf("{");
  if (startIndex === -1) {
    throw new Error("Whisper output does not contain JSON");
  }

  const jsonText = trimmed.slice(startIndex);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Failed to parse Whisper JSON output");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Whisper JSON output is invalid");
  }

  const data = parsed as { text?: string; segments?: Array<{ start?: number; end?: number; text?: string }> };
  if (typeof data.text !== "string" || !Array.isArray(data.segments)) {
    throw new Error("Whisper JSON output is missing expected fields");
  }

  const segments = data.segments.map((segment) => {
    if (typeof segment.start !== "number" || typeof segment.end !== "number" || typeof segment.text !== "string") {
      throw new Error("Whisper JSON segment is invalid");
    }

    return {
      start: segment.start,
      end: segment.end,
      text: segment.text,
    };
  });

  return {
    text: data.text,
    segments,
  };
};

export const transcribe = async (options: TranscribeOptions): Promise<TranscriptionResult> => {
  const audioPath = sanitizePath(options.file);
  assertFileExists(audioPath, "Audio file");
  const binaryPath = checkWhisperBinary(options.binaryPath);
  const modelPath = checkModel(options.modelPath);

  const args: string[] = [
    "-m",
    modelPath,
    "-f",
    audioPath,
    "--output-json",
  ];

  if (options.language) {
    args.push("-l", options.language);
  }

  if (typeof options.threads === "number") {
    args.push("-t", String(options.threads));
  }

  if (options.translate) {
    args.push("--translate");
  }

  return new Promise<TranscriptionResult>((resolve, reject) => {
    const process = spawn(binaryPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    process.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    process.on("error", (error) => {
      reject(new Error(`Failed to start Whisper process: ${error.message}`));
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Whisper process exited with code ${code}: ${stderr.trim()}`));
        return;
      }

      try {
        const result = parseWhisperJson(stdout);
        resolve(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        reject(new Error(`Failed to parse Whisper output: ${message}`));
      }
    });
  });
};
