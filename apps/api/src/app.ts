import Fastify from "fastify";
import cors from "@fastify/cors";

export const buildApp = () => {
  const app = Fastify();

  app.register(cors);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
};
