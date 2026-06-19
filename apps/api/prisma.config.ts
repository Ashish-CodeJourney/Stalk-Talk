import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(new URL(".env", import.meta.url));
} catch {
  // .env is optional (e.g. when env vars are injected by the host)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
