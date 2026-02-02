import { Command } from "commander";
import { logger, LogLevel } from "../utils/logger.js";
import { compileProtoFiles } from "../utils/proto-compiler.js";

export const compileCommand = new Command("compile")
  .description("Compile proto files to TypeScript using protobuf-ts")
  .option("--proto-dir <path>", "directory containing proto files", "proto")
  .option("--out <path>", "output directory for compiled files", "stubs")
  .option("--no-optimize-code-size", "disable code size optimization")
  .option("--no-long-type-number", "disable long type number optimization")
  .option("--verbose", "enable verbose logging")
  .option("--debug", "enable debug logging")
  .action(async (opts) => {
    try {
      if (opts.debug) {
        logger.setLevel(LogLevel.DEBUG);
      } else if (opts.verbose) {
        logger.setLevel(LogLevel.INFO);
      } else {
        logger.setLevel(LogLevel.WARN);
      }

      logger.debug("Starting proto compilation with options:", opts);

      await compileProtoFiles({
        protoDir: opts.protoDir,
        outDir: opts.out,
        optimizeCodeSize: opts.optimizeCodeSize !== false,
        longTypeNumber: opts.longTypeNumber !== false,
      });

      logger.success("\nProto compilation complete! 🎉");
    } catch (error) {
      logger.error("\nProto compilation failed:");
      logger.error(error instanceof Error ? error.message : String(error));

      if (opts.debug && error instanceof Error && error.stack) {
        logger.debug("\nStack trace:");
        logger.debug(error.stack);
      }

      process.exit(1);
    }
  });
