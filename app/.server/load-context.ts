import { AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    db: DrizzleD1Database<typeof schema>;
  }
}

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export function getLoadContext({
  context,
}: {
  request: Request;
  context: { cloudflare: Cloudflare }; // load context _before_ augmentation
}): AppLoadContext {
  const { DB } = context.cloudflare.env;
  const db = drizzle(DB, { schema });
  return {
    ...context,
    db,
  };
}
