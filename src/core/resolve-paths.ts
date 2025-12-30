export interface ResolvePathsInput {
  outDir: string;
  module: string;
  structure?: "clean" | "modules" | "flat";
  protoDir?: string;
  custom?: Partial<{
    transport: string;
    contract: string;
    repository: string;
    service: string;
    viewModel: string;
  }>;
}

export function resolvePaths(input: ResolvePathsInput) {
  const base = input.outDir.replace(/\/$/, "");
  const structure = input.structure || "clean";

  if (structure === "flat") {
    // Flat structure: all files in same directory, no subdirectories
    // modules/[module]/customer.requests.ts, customer.contract.ts, etc.
    const modulesBase =
      base.endsWith("/modules") || base.includes("/modules/")
        ? base
        : `${base}/modules`;

    return {
      transport:
        input.custom?.transport ??
        `${modulesBase}/${input.module}/${input.module}.requests.ts`,

      contract:
        input.custom?.contract ??
        `${modulesBase}/${input.module}/${input.module}.contract.ts`,

      repository:
        input.custom?.repository ??
        `${modulesBase}/${input.module}/${input.module}.repo.ts`,

      service:
        input.custom?.service ??
        `${modulesBase}/${input.module}/${input.module}.service.ts`,

      viewModel:
        input.custom?.viewModel ??
        `${modulesBase}/${input.module}/${input.module}.view-model.ts`,
    };
  }

  if (structure === "modules") {
    // modules/[module]/requests, repos, services structure
    // If base already ends with "modules" or contains "modules/", just append the module name
    // Otherwise, add the "modules" directory
    const modulesBase =
      base.endsWith("/modules") || base.includes("/modules/")
        ? base
        : `${base}/modules`;

    return {
      transport:
        input.custom?.transport ??
        `${modulesBase}/${input.module}/requests/${input.module}.requests.ts`,

      contract:
        input.custom?.contract ??
        `${modulesBase}/${input.module}/contracts/${input.module}.contract.ts`,

      repository:
        input.custom?.repository ??
        `${modulesBase}/${input.module}/repos/${input.module}.repo.ts`,

      service:
        input.custom?.service ??
        `${modulesBase}/${input.module}/services/${input.module}.service.ts`,

      viewModel:
        input.custom?.viewModel ??
        `${modulesBase}/${input.module}/view-models/${input.module}.view-model.ts`,
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

    viewModel:
      input.custom?.viewModel ??
      `${base}/presentation/${input.module}/${input.module}.view-model.ts`,
  };
}
