import path from "path";

/**
 * Calculate a relative import path from one file to another
 * @param from - Source file path (absolute)
 * @param to - Target file path (absolute)
 * @returns Relative import path without extension
 */
export function getRelativeImportPath(from: string, to: string): string {
  const fromDir = path.dirname(from);
  let relativePath = path.relative(fromDir, to);

  // Remove .ts extension
  relativePath = relativePath.replace(/\.ts$/, "");

  // Ensure proper ./ prefix for relative paths
  if (!relativePath.startsWith("..")) {
    relativePath = "./" + relativePath;
  }

  // Convert Windows paths to Unix-style
  return relativePath.replace(/\\/g, "/");
}

/**
 * Calculate all import paths needed by generators
 */
export function calculateImportPaths(paths: {
  transport: string;
  contract: string;
  repository: string;
  service: string;
}) {
  return {
    // From repository to contract
    repositoryToContract: getRelativeImportPath(
      paths.repository,
      paths.contract
    ),
    // From repository to transport
    repositoryToTransport: getRelativeImportPath(
      paths.repository,
      paths.transport
    ),
    // From service to contract
    serviceToContract: getRelativeImportPath(paths.service, paths.contract),
    // From service to repository
    serviceToRepository: getRelativeImportPath(paths.service, paths.repository),
  };
}
