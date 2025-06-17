import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import {
  DefaultLogger,
  makeTelemetryFilterString,
  Runtime,
  Worker
} from "@temporalio/worker";
import * as activities from "./activities";
import { appRouter } from "./routes/_app";
import { env } from "./env.js";
import { TASK_QUEUE_NAME } from "./shared";

const app = new Hono();

let worker: Worker;

async function startWorker() {
  // Uncomment if you need to configure Temporal Runtime
  // Runtime.install({
  //   logger: new DefaultLogger("INFO"),
  //   telemetryOptions: {
  //     logging: {
  //       forward: {},
  //       filter: makeTelemetryFilterString({ core: "TRACE" })
  //     }
  //   }
  // });
  worker = await Worker.create({
    workflowsPath: new URL("./workflows", import.meta.url).pathname,
    activities,
    namespace: "default",
    taskQueue: TASK_QUEUE_NAME
    // debugMode: true
  });
  await worker.run();
}

// Start Temporal worker
startWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});

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

// Start the server
serve({
  fetch: app.fetch,
  port: env.PORT
});

console.log(`Server is running on http://localhost:${env.PORT}`);
