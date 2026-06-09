import { buildApp } from "./app.js";

const app = buildApp();

app.listen({ port: 5000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`API listening at ${address}`);
});
