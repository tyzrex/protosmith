import { render } from "./render.js";
import type { Ctx } from "../types/index.js";

export async function generateRepository(ctx: Ctx) {
  await render({
    template: "repository",
    out: ctx.paths.repository,
    data: ctx,
  });
}
