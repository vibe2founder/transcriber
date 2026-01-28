#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { transcribe } from "./whisper";

const printUsage = (): void => {
  const usage = [
    "Usage:",
    "  ts-whisper <audio> [options]",
    "",
    "Options:",
    "  --file <path>        Write transcript text to a file",
    "  --model <path>       Path to ggml model file",
    "  --language <code>    Language code (e.g. pt, en)",
    "  --threads <number>   Number of CPU threads",
    "  --translate          Translate to English",
    "  --binary <path>      Override whisper.cpp binary path",
    "  --help               Show this help",
  ].join("\n");

  process.stdout.write(`${usage}\n`);
};

const parseArgs = (argv: string[]): {
  audioPath?: string;
  outputPath?: string;
  modelPath?: string;
  language?: string;
  threads?: number;
  translate?: boolean;
  binaryPath?: string;
  showHelp?: boolean;
} => {
  const args = [...argv];
  let audioPath: string | undefined;
  let outputPath: string | undefined;
  let modelPath: string | undefined;
  let language: string | undefined;
  let threads: number | undefined;
  let translate = false;
  let binaryPath: string | undefined;
  let showHelp = false;

  while (args.length > 0) {
    const current = args.shift();
    if (!current) {
      break;
    }

    if (!current.startsWith("-")) {
      if (!audioPath) {
        audioPath = current;
        continue;
      }
      throw new Error(`Unexpected argument: ${current}`);
    }

    switch (current) {
      case "--file": {
        const value = args.shift();
        if (!value) {
          throw new Error("--file requires a path");
        }
        outputPath = value;
        break;
      }
      case "--model": {
        const value = args.shift();
        if (!value) {
          throw new Error("--model requires a path");
        }
        modelPath = value;
        break;
      }
      case "--language": {
        const value = args.shift();
        if (!value) {
          throw new Error("--language requires a code");
        }
        language = value;
        break;
      }
      case "--threads": {
        const value = args.shift();
        if (!value) {
          throw new Error("--threads requires a number");
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error("--threads must be a positive number");
        }
        threads = parsed;
        break;
      }
      case "--translate":
        translate = true;
        break;
      case "--binary": {
        const value = args.shift();
        if (!value) {
          throw new Error("--binary requires a path");
        }
        binaryPath = value;
        break;
      }
      case "--help":
      case "-h":
        showHelp = true;
        break;
      default:
        throw new Error(`Unknown option: ${current}`);
    }
  }

  return {
    audioPath,
    outputPath,
    modelPath,
    language,
    threads,
    translate,
    binaryPath,
    showHelp,
  };
};

const writeOutput = (destination: string, text: string): void => {
  const resolved = path.resolve(destination);
  fs.writeFileSync(resolved, text, "utf8");
};

const run = async (): Promise<void> => {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    if (parsed.showHelp || !parsed.audioPath) {
      printUsage();
      process.exit(parsed.showHelp ? 0 : 1);
      return;
    }

    const result = await transcribe({
      file: parsed.audioPath,
      modelPath: parsed.modelPath,
      language: parsed.language,
      threads: parsed.threads,
      translate: parsed.translate,
      binaryPath: parsed.binaryPath,
    });

    if (parsed.outputPath) {
      writeOutput(parsed.outputPath, result.text);
    } else {
      process.stdout.write(`${result.text}\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
};

void run();
