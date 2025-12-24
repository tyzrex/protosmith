import { logger } from "@/utils/logger.js";
import fs from "fs";
import path from "path";

export function writeFile(filePath: string, content: string) {
  try {
    const dir = path.dirname(filePath);

    logger.debug(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(filePath)) {
      logger.warn(`Skipping existing file: ${filePath}`);
      return;
    }

    fs.writeFileSync(filePath, content, "utf-8");
    logger.debug(`File written successfully: ${filePath}`);
  } catch (error) {
    logger.error(`Failed to write file: ${filePath}`);
    throw error;
  }
}
