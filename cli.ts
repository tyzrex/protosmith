#!/usr/bin/env node

import { Command } from "commander";
import { generateCommand } from "./src/commands/generate.js";
import { compileCommand } from "./src/commands/compile.js";

const program = new Command();

program
  .name("protosmith")
  .description(
    "Generate api services from protobuf definitions to make your life easier.",
  )
  .version("0.1.0");

program.addCommand(generateCommand);
program.addCommand(compileCommand);

program.parse();
