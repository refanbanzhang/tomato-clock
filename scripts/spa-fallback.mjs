import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const index = path.join(dist, "index.html");

const routes = [
  "stats",
  "landing",
  "auth/login",
  "auth/register",
  "auth/forgot-password",
  "auth/callback",
  "auth/reset-password",
];

for (const route of routes) {
  const dir = path.join(dist, route);
  mkdirSync(dir, { recursive: true });
  cpSync(index, path.join(dir, "index.html"));
}

console.info("[spa-fallback] copied index.html for routes:", routes.join(", "));
