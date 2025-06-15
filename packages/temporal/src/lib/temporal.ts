import { Connection, Client } from "@temporalio/client";

// Create a connection to the Temporal server
const connection = await Connection.connect();

// Create a client instance
const client = new Client({ connection });

export default client;

export { connection };
