export interface ResolvePathsInput {
  outDir: string;
  module: string;
  structure?: "clean" | "modules";
  protoDir?: string;
  custom?: Partial<{
    transport: string;
    contract: string;
    repository: string;
    service: string;
  }>;
}

export function resolvePaths(input: ResolvePathsInput) {
  const base = input.outDir.replace(/\/$/, "");
  const structure = input.structure || "clean";

  if (structure === "modules") {
    // modules/[module]/requests, repos, services structure
    return {
      transport:
        input.custom?.transport ??
        `${base}/modules/${input.module}/requests/${input.module}.requests.ts`,

      contract:
        input.custom?.contract ??
        `${base}/modules/${input.module}/contracts/${input.module}.contract.ts`,

      repository:
        input.custom?.repository ??
        `${base}/modules/${input.module}/repos/${input.module}.repo.ts`,

      service:
        input.custom?.service ??
        `${base}/modules/${input.module}/services/${input.module}.service.ts`,
    };
  }

  // Clean architecture structure (default)
  return {
    transport:
      input.custom?.transport ??
      `${base}/transport/gateway/gRPC/requests/${input.module}.requests.ts`,

    contract:
      input.custom?.contract ??
      `${base}/domain/${input.module}/${input.module}.contract.ts`,

    repository:
      input.custom?.repository ??
      `${base}/repository/${input.module}/${input.module}.grpc.repo.ts`,

    service:
      input.custom?.service ??
      `${base}/service/${input.module}/${input.module}.service.ts`,
  };
}
