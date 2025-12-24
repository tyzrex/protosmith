import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import prettier from "prettier";
import { writeFile } from "../utils/write.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RenderInput {
  template: string;
  out: string;
  data: any;
}

export async function render({ template, out, data }: RenderInput) {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${template}.hbs`
    );

    logger.debug(`Reading template: ${templatePath}`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const raw = fs.readFileSync(templatePath, "utf-8");
    const compiled = Handlebars.compile(raw);
    const content = compiled(data);

    logger.debug(`Formatting content with Prettier...`);

    const formatted = await prettier.format(content, {
      parser: "typescript",
      singleQuote: true,
      tabWidth: 4,
    });

    logger.debug(`Writing to: ${out}`);
    writeFile(out, formatted);
  } catch (error) {
    logger.error(`Failed to render ${template}:`);
    throw error;
  }
}
