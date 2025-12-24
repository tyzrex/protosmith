import { render } from "./render.js";

export async function generateService(ctx: any) {
  await render({
    template: "service",
    out: ctx.paths.service,
    data: ctx,
  });
}
