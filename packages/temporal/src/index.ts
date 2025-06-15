import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { Worker } from "@temporalio/worker";
import * as activities from "./activities";
import { appRouter } from "./routes/_app";
import { env } from "./env.js";

const app = new Hono();

let worker: Worker;

async function startWorker() {
  worker = await Worker.create({
    workflowsPath: new URL("./workflows", import.meta.url).pathname,
    activities,
    namespace: "default",
    taskQueue: "contest-queue"
  });
  await worker.run();
}

// Start Temporal worker
startWorker().catch(console.error);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter
  })
);

// Graceful shutdown handler
async function shutdownGracefully() {
  console.log("Shutting down gracefully...");
  if (worker) {
    await worker.shutdown();
    console.log("Temporal worker shut down.");
  }
  process.exit(0);
}

// Register shutdown handlers
process.on("SIGTERM", shutdownGracefully);
process.on("SIGINT", shutdownGracefully);

export default {
  port: env.PORT,
  fetch: app.fetch
};

console.log(`Server is running on http://localhost:${env.PORT}`);
