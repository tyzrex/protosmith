import { render } from "./render.js";

export async function generateRepository(ctx: any) {
  await render({
    template: "repository",
    out: ctx.paths.repository,
    data: ctx,
  });
}
