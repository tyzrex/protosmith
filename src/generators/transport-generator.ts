import { render } from "./render.js";
import type { Ctx } from "../types/index.js";

export async function generateTransport(ctx: Ctx) {
  await render({
    template: "transport",
    out: ctx.paths.transport,
    data: ctx,
  });
}
