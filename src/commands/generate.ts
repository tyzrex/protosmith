import { Command } from "commander";
import path from "path";
import fs from "fs";
import { logger, LogLevel } from "@/utils/logger.js";
import { findServiceDescriptors } from "@/utils/file-finder.js";

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

    let input;

    if (opts.interactive) {
      logger.info("🔍 Scanning for service descriptor files...");
      const serviceFiles = findServiceDescriptors();

      logger.debug("Discovered service descriptor files:", serviceFiles);

      if (serviceFiles.length === 0) {
        logger.error(
          "No service descriptor files found (files ending with -service.ts)"
        );
        logger.info(
          "Make sure you have compiled your proto files first with protobuf-ts"
        );
        process.exit(1);
      }

      logger.info(`✓ Found ${serviceFiles.length} service descriptor(s)\n`);
    }
  });
