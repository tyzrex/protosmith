import { render } from "./render.js";
import type { Ctx } from "../types/index.js";

export async function generateService(ctx: Ctx) {
  await render({
    template: "service",
    out: ctx.paths.service,
    data: ctx,
  });
}
