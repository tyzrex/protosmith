import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

const execAsync = promisify(exec);

export interface CompileProtoOptions {
  protoDir: string;
  outDir: string;
  protoFiles?: string[];
  optimizeCodeSize?: boolean;
  longTypeNumber?: boolean;
}

export async function compileProtoFiles(
  options: CompileProtoOptions,
): Promise<string[]> {
  const {
    protoDir,
    outDir,
    protoFiles,
    optimizeCodeSize = true,
    longTypeNumber = true,
  } = options;

  logger.step("COMPILE", "Compiling proto files...");

  const resolvedProtoDir = path.isAbsolute(protoDir)
    ? protoDir
    : path.join(process.cwd(), protoDir);

  const resolvedOutDir = path.isAbsolute(outDir)
    ? outDir
    : path.join(process.cwd(), outDir);

  if (!fs.existsSync(resolvedProtoDir)) {
    throw new Error(`Proto directory not found: ${resolvedProtoDir}`);
  }

  const files = protoFiles || findProtoFiles(resolvedProtoDir);

  if (files.length === 0) {
    throw new Error(`No .proto files found in ${resolvedProtoDir}`);
  }

  logger.info(`  → Found ${files.length} proto file(s)`);

  fs.mkdirSync(resolvedOutDir, { recursive: true });

  const tsOptions: string[] = [];
  if (optimizeCodeSize) tsOptions.push("optimize_code_size");
  if (longTypeNumber) tsOptions.push("long_type_number");

  const tsOpt = tsOptions.join(",");

  const filesArg = files.map((f) => path.join(resolvedProtoDir, f)).join(" ");

  const command = `protoc -I="${resolvedProtoDir}" --plugin=protoc-gen-ts=node_modules/.bin/protoc-gen-ts --ts_opt=${tsOpt} --ts_out="${resolvedOutDir}" ${filesArg}`;

  logger.debug(`  → Running: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
    });

    if (stdout) logger.debug(`  → stdout: ${stdout}`);
    if (stderr) logger.debug(`  → stderr: ${stderr}`);

    const generatedFiles = findGeneratedFiles(resolvedOutDir);

    logger.success(`  ✓ Generated ${generatedFiles.length} TypeScript file(s)`);

    return generatedFiles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to compile proto files: ${errorMessage}`);
  }
}

function findProtoFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findProtoFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".proto")) {
      files.push(path.relative(dir, fullPath));
    }
  }

  return files.sort();
}

function findGeneratedFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(path.relative(process.cwd(), fullPath));
    }
  }

  return files.sort();
}
