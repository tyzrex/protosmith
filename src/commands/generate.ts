import { Command } from "commander";
import path from "path";
import fs from "fs";
import { logger, LogLevel } from "@/utils/logger.js";
import { findServiceDescriptors, getDirectories } from "@/utils/file-finder.js";
import { select, input, checkbox } from "@inquirer/prompts";

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

    let inputData: {
      descriptor: string;
      out: string;
      service: string;
      module: string;
      structure: "clean" | "modules";
      layers: string[];
    };

    if (opts.interactive) {
      console.log("");
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

      // Interactive prompts with file selection
      const descriptor = await select({
        message: "Select service descriptor file:",
        choices: serviceFiles,
      });

      const outDir = await select({
        message: "Select output directory:",
        choices: [...getDirectories(), "Enter custom path"],
        default: "src",
      });

      const serviceName = await input({
        message: "Service name (e.g., CustomerService):",
        validate: (val: string) => val.length > 0 || "Service name is required",
      });

      const moduleName = await input({
        message: "Module name (e.g., customer):",
        validate: (val: string) => val.length > 0 || "Module name is required",
      });

      const structure: "clean" | "modules" = await select({
        message: "Select output structure:",
        choices: [
          {
            name: "clean",
            description: "Clean Architecture",
            value: "clean",
          },
          {
            name: "modules",
            description: "Modules/[module]/... structure",
            value: "modules",
          },
        ],
      });

      const layers = await checkbox({
        message: "Select layers to generate:",
        choices: [
          {
            name: "Transport (gRPC requests)",
            value: "transport",
            checked: true,
          },
          {
            name: "Contract (interfaces)",
            value: "contract",
            checked: false,
          },
          {
            name: "Repository (implementation)",
            value: "repository",
            checked: false,
          },
          {
            name: "Service (business logic)",
            value: "service",
            checked: false,
          },
        ],
        validate: (val) => {
          return val.length > 0 || "Select at least one layer to generate";
        },
        theme: {
          icon: {
            checked: " ✔",
            unchecked: " ✖",
            cursor: "➔",
          },
        },
      });

      inputData = {
        descriptor,
        out:
          outDir === "Enter custom path"
            ? await input({
                message: "Enter custom output path:",
                validate: (val: string) =>
                  val.length > 0 || "Output path is required",
              })
            : outDir,
        service: serviceName,
        module: moduleName,
        structure: structure,
        layers,
      };

      logger.info("✅ Input collection complete.\n");
      logger.debug("Final input data:", inputData);
    } else if (!opts.service || !opts.descriptor || !opts.module) {
      console.log("");
      logger.warn(
        "Missing required options. Switching to interactive mode...\n"
      );
    }
  });
