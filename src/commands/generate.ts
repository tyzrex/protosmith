import { Command } from "commander";
import path from "path";
import fs from "fs";
import { logger, LogLevel } from "@/utils/logger.js";

interface Options {
  interactive?: boolean;
  service?: string;
  descriptor?: string;
  module?: string;
  protoDir?: string;
  out?: string;
  structure?: "clean" | "modules";
  layers?: string;
  verbose?: boolean;
  debug?: boolean;
}

export const generateCommand = new Command("generate")
  .option("--interactive", "interactive mode")
  .option("--service <name>", "service name to generate from")
  .option("--descriptor <path>", "path to compiled proto descriptor (.ts file)")
  .option("--module <name>", "module name for output files")
  .option(
    "--proto-dir <path>",
    "directory containing proto files (for auto-detection)"
  )
  .option("--out <path>", "output root directory", "src")
  .option(
    "--structure <type>",
    "output structure: 'clean' (default) or 'modules'",
    "clean"
  )
  .option("--layers <layers>", "comma separated layers to generate")
  .option("--verbose", "enable verbose logging")
  .option("--debug", "enable debug logging")
  .action(async (opts: Options) => {
    if (opts.debug) {
      logger.setLevel(LogLevel.DEBUG);
    } else if (opts.verbose) {
      logger.setLevel(LogLevel.INFO);
    } else {
      logger.setLevel(LogLevel.WARN);
    }
    logger.debug("Starting generation with options:", opts);
  });
