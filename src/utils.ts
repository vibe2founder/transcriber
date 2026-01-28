import fs from "fs";
import path from "path";

export const getPlatformBinaryName = (): string => {
  if (process.platform === "win32") {
    return "whisper.exe";
  }
  return "whisper";
};

export const getDefaultBinaryPath = (): string => {
  const binaryName = getPlatformBinaryName();
  return path.resolve(__dirname, "..", "bin", binaryName);
};

export const getDefaultModelPath = (): string => {
  return path.resolve(__dirname, "..", "models", "ggml-base.bin");
};

export const assertFileExists = (filePath: string, label: string): void => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found at ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`${label} is not a file at ${filePath}`);
  }
};

export const checkWhisperBinary = (binaryPath?: string): string => {
  const resolvedPath = binaryPath ?? getDefaultBinaryPath();
  assertFileExists(resolvedPath, "Whisper binary");
  return resolvedPath;
};

export const checkModel = (modelPath?: string): string => {
  const resolvedPath = modelPath ?? getDefaultModelPath();
  assertFileExists(resolvedPath, "Whisper model");
  return resolvedPath;
};

export const sanitizePath = (inputPath: string): string => {
  return path.resolve(inputPath);
};
