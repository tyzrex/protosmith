import { render } from "./render.js";
import type { Ctx } from "../types/index.js";

export async function generateViewModel(ctx: Ctx) {
  await render({
    template: "view-model",
    out: ctx.paths.viewModel,
    data: ctx,
  });
}
