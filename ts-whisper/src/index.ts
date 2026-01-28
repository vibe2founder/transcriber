import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export interface IWhisperOptions {
  file: string;
  model?: "tiny" | "base" | "small" | "medium" | "large" | "turbo";
  language?: string;
  translate?: boolean;
}

export interface IWhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface IWhisperOutput {
  text: string;
  segments: IWhisperSegment[];
  language: string;
}

export interface ITranscribeResult {
    text: string;
    segments: {
        start: number;
        end: number;
        text: string;
    }[];
}

/**
 * Checks if the 'whisper' command is available in the system PATH.
 * @returns {Promise<boolean>} True if installed, false otherwise.
 */
export async function checkWhisperInstalled(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const process = spawn("which", ["whisper"]);
        process.on("close", (code) => {
            resolve(code === 0);
        });
        process.on("error", () => {
            resolve(false);
        });
    });
}

/**
 * Transcribes an audio file using OpenAI's Whisper CLI.
 * @param {IWhisperOptions} options - The transcription options.
 * @returns {Promise<ITranscribeResult>} The transcription result.
 */
export async function transcribe(options: IWhisperOptions): Promise<ITranscribeResult> {
    // 1. Validation
    try {
        await fs.access(options.file);
    } catch {
        throw new Error(`File not found: ${options.file}`);
    }

    // 2. Prepare args and temp directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ts-whisper-"));
    const args = [options.file, "--output_dir", tempDir, "--output_format", "json"];

    if (options.model) {
        args.push("--model", options.model);
    }
    if (options.language) {
        args.push("--language", options.language);
    }
    if (options.translate) {
        args.push("--task", "translate");
    }

    // 3. Spawn process
    return new Promise((resolve, reject) => {
        const process = spawn("whisper", args);

        let stderr = "";
        process.stderr.on("data", (d) => stderr += d.toString());

        process.on("error", async (err) => {
             await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
             reject(err);
        });

        process.on("close", async (code) => {
            if (code !== 0) {
                await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
                reject(new Error(`Whisper exited with code ${code}: ${stderr}`));
                return;
            }

            try {
                // 4. Read Output
                // Whisper outputs a file with the same basename as the input but with .json extension.
                // We use path.parse to handle extensions correctly.
                const parsedPath = path.parse(options.file);
                // If input is "file.mp3", name is "file", output is "file.json"
                // If input is "file.tar.gz", name is "file.tar", output is "file.tar.json" (Whisper behavior depends on how it splits)
                // Standard python os.path.splitext splits only the LAST extension. Node path.parse also splits the last extension.
                // So "my.file.wav" -> name="my.file", ext=".wav". Output -> "my.file.json".

                const jsonFile = path.join(tempDir, parsedPath.name + ".json");

                const content = await fs.readFile(jsonFile, "utf-8");
                const result = JSON.parse(content) as IWhisperOutput;

                // 5. Cleanup
                await fs.rm(tempDir, { recursive: true, force: true });

                // 6. Return
                resolve({
                    text: result.text.trim(),
                    segments: result.segments.map(s => ({
                        start: s.start,
                        end: s.end,
                        text: s.text.trim()
                    }))
                });
            } catch (err) {
                 await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
                 reject(new Error(`Failed to parse Whisper output or file missing: ${err}`));
            }
        });
    });
}
