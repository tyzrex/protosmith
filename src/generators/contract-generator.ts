import type { Ctx } from "../types/index.js";
import { render } from "./render.js";

export async function generateContract(ctx: Ctx) {
  await render({
    template: "contract",
    out: ctx.paths.contract,
    data: ctx,
  });
}
