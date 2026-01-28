import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface TranscribeOptions {
  /** Path to the audio file */
  file: string;
  /** Whisper model to use */
  model?: "tiny" | "base" | "small" | "medium" | "large" | "turbo";
  /** Language of the audio (e.g. 'en', 'pt', 'Japanese') */
  language?: string;
  /** If true, translates the audio to English */
  translate?: boolean;
}

export interface Segment {
  start: number;
  end: number;
  text: string;
}

export interface TranscribeResult {
  text: string;
  segments: Segment[];
}

/**
 * Checks if the 'whisper' command line tool is available.
 * Throws an error if not found.
 */
const checkWhisperInstalled = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = spawn('whisper', ['--help']);

    process.on('error', () => {
        reject(new Error('Whisper CLI is not installed or not found in PATH. Please install it using "pip install -U openai-whisper".'));
    });

    process.on('close', (code) => {
        if (code === 0) {
            resolve();
        } else {
             // If exit code is not 0, it might mean help failed, but usually it means the binary exists.
             resolve();
        }
    });
  });
};

/**
 * Transcribes an audio file using the locally installed Whisper CLI.
 */
export const transcribe = async (options: TranscribeOptions): Promise<TranscribeResult> => {
    if (!fs.existsSync(options.file)) {
        throw new Error(`File not found: ${options.file}`);
    }

    await checkWhisperInstalled();

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'whisper-ts-'));

    try {
        const args = [
            options.file,
            '--output_format', 'json',
            '--output_dir', tempDir,
            '--verbose', 'False' // suppress verbose output to stdout
        ];

        if (options.model) {
            args.push('--model', options.model);
        }

        if (options.language) {
            args.push('--language', options.language);
        }

        if (options.translate) {
            args.push('--task', 'translate');
        }

        return await new Promise<TranscribeResult>((resolve, reject) => {
            const process = spawn('whisper', args);

            let stderr = '';

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('error', (err) => {
                reject(new Error(`Failed to spawn whisper: ${err.message}`));
            });

            process.on('close', (code) => {
                if (code === 0) {
                    const baseName = path.basename(options.file, path.extname(options.file));
                    const jsonFile = path.join(tempDir, `${baseName}.json`);

                    if (fs.existsSync(jsonFile)) {
                        try {
                            const content = fs.readFileSync(jsonFile, 'utf-8');
                            const data = JSON.parse(content);

                            const result: TranscribeResult = {
                                text: data.text.trim(),
                                segments: data.segments.map((s: any) => ({
                                    start: s.start,
                                    end: s.end,
                                    text: s.text.trim()
                                }))
                            };
                            resolve(result);
                        } catch (parseErr: any) {
                            reject(new Error(`Failed to parse whisper output: ${parseErr.message}`));
                        }
                    } else {
                        reject(new Error(`Whisper finished successfully but output file was not found at ${jsonFile}`));
                    }
                } else {
                    reject(new Error(`Whisper exited with code ${code}. Error: ${stderr}`));
                }
            });
        });
    } finally {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore cleanup errors
        }
    }
};
