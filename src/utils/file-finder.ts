import fs from "fs";
import path from "path";

export interface FindFilesOptions {
  pattern: RegExp;
  rootDir?: string;
  maxDepth?: number;
  excludeDirs?: string[];
}

/**
 * Recursively find files matching a pattern
 */
export function findFiles(options: FindFilesOptions): string[] {
  const {
    pattern,
    rootDir = process.cwd(),
    maxDepth = 10,
    excludeDirs = ["node_modules", "dist", ".git", "build"],
  } = options;

  const results: string[] = [];

  function search(dir: string, depth: number) {
    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            search(fullPath, depth + 1);
          }
        } else if (entry.isFile() && pattern.test(entry.name)) {
          // Return relative path from rootDir
          results.push(path.relative(rootDir, fullPath));
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  search(rootDir, 0);
  return results.sort();
}

/**
 * Find all compiled proto service files
 */
export function findServiceDescriptors(
  rootDir: string = process.cwd()
): string[] {
  const allFiles = findFiles({
    pattern: /-service\.ts$/,
    rootDir,
    maxDepth: 8,
  });

  // Filter out load-service.ts and only keep files in stubs/proto directories
  return allFiles.filter((file) => {
    const normalized = file.toLowerCase();
    return (
      !normalized.includes("load-service") &&
      (normalized.includes("stub") ||
        normalized.includes("proto") ||
        normalized.includes("grpc"))
    );
  });
}

/**
 * Get list of directories for selection
 */
export function getDirectories(rootDir: string = process.cwd()): string[] {
  const dirs = ["./", "./src", "./app", "./lib"];

  try {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        !["node_modules", "dist", "build"].includes(entry.name)
      ) {
        dirs.push(`./${entry.name}`);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  return [...new Set(dirs)].sort();
}
