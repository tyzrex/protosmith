import { Command } from "commander";
import path from "path";
import fs from "fs";
import { logger, LogLevel } from "../utils/logger.js";
import {
  findServiceDescriptors,
  getDirectories,
} from "../utils/file-finder.js";
import { select, input, checkbox } from "@inquirer/prompts";
import { loadServiceDescriptor } from "../core/load-service.js";
import { resolvePaths } from "../core/resolve-paths.js";
import { calculateImportPaths } from "../utils/import-path.js";
import type {
  Ctx,
  InteractiveInput,
  NonInteractiveInput,
  Options,
  StructureType,
} from "../types/index.js";
import { generateTransport } from "../generators/transport-generator.js";
import { generateContract } from "../generators/contract-generator.js";
import { generateRepository } from "../generators/repository-generator.js";
import { generateService } from "../generators/service-generator.js";
import { generateViewModel } from "../generators/view-model-generator.js";

export const generateCommand = new Command("generate")
  .option("--interactive", "interactive mode")
  .option("--service <name>", "service name to generate from")
  .option("--descriptor <path>", "path to compiled proto descriptor (.ts file)")
  .option("--module <name>", "module name for output files")
  .option(
    "--proto-dir <path>",
    "directory containing proto files (for auto-detection)",
  )
  .option("--out <path>", "output root directory", "src")
  .option(
    "--structure <type>",
    "output structure: 'clean' (default) or 'modules'",
    "clean",
  )
  .option("--layers <layers>", "comma separated layers to generate")
  .option("--verbose", "enable verbose logging")
  .option("--debug", "enable debug logging")
  .action(async (opts: Options) => {
    try {
      if (opts.debug) {
        logger.setLevel(LogLevel.DEBUG);
      } else if (opts.verbose) {
        logger.setLevel(LogLevel.INFO);
      } else {
        logger.setLevel(LogLevel.WARN);
      }
      logger.debug("Starting generation with options:", opts);

      let interactiveInputData: InteractiveInput = {
        descriptor: "",
        out: "",
        service: "",
        module: "",
        structure: "clean",
        layers: [],
      };

      const layers = opts.layers
        ? opts.layers.split(",").map((l: string) => l.trim())
        : [];

      let inputData: NonInteractiveInput = {
        ...opts,
        layers,
      };

      if (opts.interactive) {
        console.log("");
        logger.info("🔍 Scanning for service descriptor files...");
        const serviceFiles = findServiceDescriptors();

        logger.debug("Discovered service descriptor files:", serviceFiles);

        if (serviceFiles.length === 0) {
          logger.error(
            "No service descriptor files found (files ending with -service.ts)",
          );
          logger.info(
            "Make sure you have compiled your proto files first with protobuf-ts",
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
          validate: (val: string) =>
            val.length > 0 || "Service name is required",
        });

        const moduleName = await input({
          message: "Module name (e.g., customer):",
          validate: (val: string) =>
            val.length > 0 || "Module name is required",
        });

        const structure: "clean" | "modules" | "flat" = await select({
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
            {
              name: "flat",
              description: "All layers in a single file",
              value: "flat",
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
            {
              name: "ViewModel (Svelte 5 presentation)",
              value: "viewModel",
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

        interactiveInputData = {
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
          "Missing required options. Switching to interactive mode...\n",
        );

        // Find all service descriptor files
        logger.info("🔍 Scanning for service descriptor files...");
        const serviceFiles = findServiceDescriptors();

        logger.debug("Discovered service descriptor files:", serviceFiles);

        if (serviceFiles.length === 0) {
          logger.error(
            "No service descriptor files found (files ending with -service.ts)",
          );
          logger.info(
            "Make sure you have compiled your proto files first with protobuf-ts",
          );
          process.exit(1);
        }

        logger.info(`✓ Found ${serviceFiles.length} service descriptor(s)\n`);
      } else {
        inputData = {
          ...opts,
          layers: opts.layers
            ? opts.layers.split(",").map((l: string) => l.trim())
            : ["transport", "contract", "repository", "service", "viewModel"],
        };
      }

      const finalInput = opts.interactive ? interactiveInputData : inputData;

      if (!finalInput.service) {
        logger.error(
          "Service name is required. Use --service <name> or --interactive",
        );
        process.exit(1);
      }
      if (!finalInput.descriptor) {
        logger.error(
          "Descriptor path is required. Use --descriptor <path> or --interactive",
        );
        process.exit(1);
      }
      if (!finalInput.module) {
        logger.error(
          "Module name is required. Use --module <name> or --interactive",
        );
        process.exit(1);
      }

      logger.step("VALIDATE", "Checking descriptor file...");

      // Resolve descriptor path safely
      const descriptorPath = path.isAbsolute(finalInput.descriptor)
        ? finalInput.descriptor
        : path.join(process.cwd(), finalInput.descriptor);

      logger.debug("Resolved descriptor path:", descriptorPath);

      if (!fs.existsSync(descriptorPath)) {
        logger.error(`Descriptor file not found: ${descriptorPath}`);
        logger.info(
          "Make sure to compile your .proto files first using protobuf-ts",
        );
        logger.info(
          "Example: npx protoc --ts_out . --proto_path . proto/*.proto",
        );
        process.exit(1);
      }

      logger.step("LOAD", "Loading service descriptor...");
      const schema = await loadServiceDescriptor(
        descriptorPath,
        finalInput.service,
      );
      logger.debug("Loaded schema:", schema);
      logger.success(
        `Found ${schema.methods.length} methods in ${schema.name}`,
      );

      logger.step("RESOLVE", "Resolving output paths...");

      const paths = resolvePaths({
        outDir: finalInput.out || "src",
        module: finalInput.module,
        structure: opts.interactive
          ? interactiveInputData.structure
          : (opts.structure as StructureType) || "clean",
        protoDir: opts.protoDir || "proto",
      });

      logger.debug("Output paths:", paths);

      // Calculate relative import paths
      const importPaths = calculateImportPaths(paths);
      logger.debug("Import paths:", importPaths);

      const descriptorFile = path.basename(
        descriptorPath,
        path.extname(descriptorPath),
      );

      let ctx: Ctx;

      if (opts.interactive) {
        ctx = {
          ...interactiveInputData,
          schema,
          paths,
          importPaths,
          descriptor: descriptorFile,
          mode: "interactive",
        };
      } else {
        const structureValue = (opts.structure as StructureType) || "clean";
        ctx = {
          ...inputData,
          schema,
          paths,
          importPaths,
          descriptor: descriptorFile,
          opts,
          structure: structureValue,
          mode: "non-interactive",
        };
      }

      const isFlat = ctx.structure === "flat";

      if (isFlat) {
        logger.step(
          "GENERATE",
          `Generating flat structure for: ${ctx.layers.join(", ")}`,
        );
      } else {
        logger.step("GENERATE", `Generating layers: ${ctx.layers.join(", ")}`);
      }

      if (ctx.layers.includes("transport")) {
        logger.info("  → Generating transport layer...");
        await generateTransport(ctx);
        logger.success(`  ✓ ${paths.transport}`);
      }

      if (ctx.layers.includes("contract")) {
        logger.info("  → Generating contract layer...");
        await generateContract(ctx);
        logger.success(`  ✓ ${paths.contract}`);
      }

      if (ctx.layers.includes("repository")) {
        logger.info("  → Generating repository layer...");
        await generateRepository(ctx);
        logger.success(`  ✓ ${paths.repository}`);
      }

      if (ctx.layers.includes("service")) {
        logger.info("  → Generating service layer...");
        await generateService(ctx);
        logger.success(`  ✓ ${paths.service}`);
      }

      if (ctx.layers.includes("viewModel")) {
        logger.info("  → Generating view model layer...");
        await generateViewModel(ctx);
        logger.success(`  ✓ ${paths.viewModel}`);
      }

      logger.success("\nGeneration complete! 🎉");
    } catch (error) {
      logger.error("\nGeneration failed:");
      logger.error(error instanceof Error ? error.message : String(error));

      if (opts.debug && error instanceof Error && error.stack) {
        logger.debug("\nStack trace:");
        logger.debug(error.stack);
      }

      process.exit(1);
    }
  });
