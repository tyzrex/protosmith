import { render } from "./render.js";

export async function generateContract(ctx: any) {
  await render({
    template: "contract",
    out: ctx.paths.contract,
    data: ctx,
  });
}
