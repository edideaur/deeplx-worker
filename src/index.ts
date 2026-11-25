import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import z from "zod";
import { deepLXTranslator } from "./deeplx";
import { zValidator } from "./zod-validator";

type Env = { Bindings: Cloudflare.Env };

/** Used when no `TOKEN` is set in `.env` / Worker secrets. */
const DEFAULT_TOKEN = "didylate";

const app = new Hono<Env>().basePath("/hi");

/**
 * Bearer auth. Always enforced: requires `Authorization: Bearer <TOKEN>`,
 * where `TOKEN` comes from the environment (`.env` locally, a Worker secret
 * in production) and falls back to `DEFAULT_TOKEN`.
 */
const bearerAuth = createMiddleware<Env>(async (c, next) => {
  const token = c.env.TOKEN || DEFAULT_TOKEN;

  if (c.req.header("Authorization") !== `Bearer ${token}`) {
    return c.text("Unauthorized", 401);
  }

  await next();
});

app.post(
  "/translate",
  bearerAuth,
  zValidator(
    "json",
    z.object({
      sourceLang: z.string().min(1),
      targetLang: z.string().min(1),
      text: z.string().min(1),
    }),
  ),
  async (c) => {
    const data = c.req.valid("json");
    const res = await deepLXTranslator.translate(data);
    return c.json(res, { status: res.code });
  },
);

export default app;
