import { logger } from "@/utils/logger.js";

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
        const method = {
          name: methodName,
          originalName: m.name,
          localName: m.localName,
          input: m.I?.typeName?.split(".").pop() || "Unknown",
          output: m.O?.typeName?.split(".").pop() || "Unknown",
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
