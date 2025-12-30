interface BaseCtx {
  schema: {
    name: string;
    methods: any[];
  };
  paths: {
    transport: string;
    contract: string;
    repository: string;
    service: string;
    viewModel: string;
  };
  importPaths: {
    repositoryToContract: string;
    repositoryToTransport: string;
    serviceToContract: string;
    serviceToRepository: string;
    viewModelToRepository: string;
  };
  descriptor: string;
  layers: string[];
  isFlatStructure?: boolean;
}

export interface NonInteractiveCtx extends BaseCtx {
  mode: "non-interactive";
  opts: Options;
  structure: "clean" | "modules" | "flat";
}

export interface InteractiveCtx extends BaseCtx {
  mode: "interactive";
  out: string;
  service: string;
  module: string;
  structure: "clean" | "modules" | "flat";
  layers: string[];
}

export type Ctx = InteractiveCtx | NonInteractiveCtx;

export interface Options {
  interactive?: boolean;
  service?: string;
  descriptor?: string;
  module?: string;
  protoDir?: string;
  out?: string;
  structure?: "clean" | "modules" | "flat";
  layers?: string;
  verbose?: boolean;
  debug?: boolean;
}

export type StructureType = "clean" | "modules" | "flat";

export interface InteractiveInput {
  descriptor: string;
  out: string;
  service: string;
  module: string;
  structure: "clean" | "modules" | "flat";
  layers: string[];
}

export type NonInteractiveInput = {
  layers: string[];
} & Omit<Options, "layers">;
