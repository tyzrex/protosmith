import { render } from "./render.js";

export async function generateTransport(ctx: any) {
  await render({
    template: "transport",
    out: ctx.paths.transport,
    data: ctx,
  });
}
