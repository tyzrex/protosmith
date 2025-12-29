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
  };
  importPaths: {
    repositoryToContract: string;
    repositoryToTransport: string;
    serviceToContract: string;
    serviceToRepository: string;
  };
  descriptor: string;
  layers: string[];
}

export interface NonInteractiveCtx extends BaseCtx {
  mode: "non-interactive";
  opts: Options;
}

export interface InteractiveCtx extends BaseCtx {
  mode: "interactive";
  out: string;
  service: string;
  module: string;
  structure: "clean" | "modules";
}

export type Ctx = InteractiveCtx | NonInteractiveCtx;

export interface Options {
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

export type StructureType = "clean" | "modules";

export interface InteractiveInput {
  descriptor: string;
  out: string;
  service: string;
  module: string;
  structure: "clean" | "modules";
  layers: string[];
}

export type NonInteractiveInput = {
  layers: string[];
} & Omit<Options, "layers">;
