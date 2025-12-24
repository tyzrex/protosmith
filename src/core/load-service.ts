import { logger } from "../utils/logger.js";
import path from "path";
import fs from "fs";

/**
 * Scans all stub files in the same directory and finds where each type is actually exported
 */
async function buildTypeSourceMap(
  descriptorPath: string
): Promise<Map<string, string>> {
  const typeMap = new Map<string, string>();
  const stubsDir = path.dirname(descriptorPath);

  try {
    const files = fs
      .readdirSync(stubsDir)
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".client.ts"));

    logger.debug(`Scanning ${files.length} stub files for type definitions`);

    for (const file of files) {
      const filePath = path.join(stubsDir, file);
      const fileUrl = `file://${filePath}`;

      try {
        const mod = await import(fileUrl);
        const exports = Object.keys(mod);
        const baseName = path.basename(file, ".ts");

        // Map each exported type to this file
        exports.forEach((exportName) => {
          // Skip certain exports that aren't types
          if (exportName !== "default" && !exportName.endsWith("Client")) {
            typeMap.set(exportName, baseName);
          }
        });

        logger.debug(`  ${baseName}: ${exports.length} exports`);
      } catch (err) {
        logger.debug(`  Skipping ${file}: ${err}`);
      }
    }

    logger.debug(`Built type map with ${typeMap.size} entries`);
  } catch (error) {
    logger.warn("Failed to build type source map:", error);
  }

  return typeMap;
}

export async function loadServiceDescriptor(
  descriptorPath: string,
  serviceName: string
): Promise<{ name: string; methods: any[] }> {
  try {
    logger.debug(`Importing descriptor from: ${descriptorPath}`);

    // Use file:// protocol for dynamic imports
    const importUrl = descriptorPath.startsWith("file://")
      ? descriptorPath
      : `file://${descriptorPath}`;

    const mod = await import(importUrl);

    logger.debug("Available exports:", Object.keys(mod));

    const service = mod[serviceName];

    if (!service) {
      throw new Error(
        `Service "${serviceName}" not found in descriptor.\nAvailable exports: ${Object.keys(
          mod
        ).join(", ")}`
      );
    }

    if (!service.methods) {
      throw new Error(
        `Service "${serviceName}" exists but has no methods property. ` +
          `Make sure you're loading a protobuf-ts compiled service.`
      );
    }

    logger.debug(`Service methods:`, Object.keys(service.methods));

    // Build type source map by scanning all stub files
    const typeSourceMap = await buildTypeSourceMap(descriptorPath);

    // protobuf-ts exports methods as an array
    const methodsArray = Array.isArray(service.methods)
      ? service.methods
      : Object.values(service.methods);

    return {
      name: serviceName,
      methods: methodsArray.map((m: any) => {
        // Use localName (camelCase) for method names
        const methodName =
          m.localName || m.name.charAt(0).toLowerCase() + m.name.slice(1);

        // Extract type info with source file
        const getTypeInfo = (typeDescriptor: any) => {
          if (!typeDescriptor?.typeName)
            return { name: "Unknown", source: null, fullTypeName: undefined };

          const fullTypeName = typeDescriptor.typeName as string;
          const typeName = fullTypeName.split(".").pop() || "Unknown";

          // Look up the actual source file from our type map
          let source: string | null = typeSourceMap.get(typeName) || null;

          // If not found in type map, fall back to current descriptor
          if (!source) {
            const descriptorFile = path.basename(descriptorPath, ".ts");
            source = descriptorFile;
            logger.debug(
              `Type ${typeName} not found in map, using descriptor: ${source}`
            );
          } else {
            logger.debug(`Type ${typeName} mapped to source: ${source}`);
          }

          return { name: typeName, source, fullTypeName };
        };

        const inputInfo = getTypeInfo(m.I);
        const outputInfo = getTypeInfo(m.O);

        const method = {
          name: methodName,
          originalName: m.name,
          localName: m.localName,
          input: inputInfo.name,
          output: outputInfo.name,
          inputSource: inputInfo.source,
          outputSource: outputInfo.source,
          inputFullType: inputInfo.fullTypeName,
          outputFullType: outputInfo.fullTypeName,
        };
        logger.debug(`  - ${method.name}(${method.input}) → ${method.output}`);
        return method;
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      // Provide helpful error messages
      if (error.message.includes("Cannot find module")) {
        throw new Error(
          `Failed to load descriptor: ${descriptorPath}\n` +
            `Make sure the file exists and is a compiled TypeScript/JavaScript file.`
        );
      }
      throw error;
    }
    throw new Error(`Failed to load service descriptor: ${String(error)}`);
  }
}
