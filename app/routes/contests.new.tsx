import type { Route } from "./+types/contests.new";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, redirect, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { contests as contestsSchema } from "database/schema/contest.sql";
import { Client, Connection } from "@temporalio/client";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().pipe(z.coerce.date()),
  endTime: z.string().pipe(z.coerce.date())
});

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  // Send the submission back to the client if the status is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { title, description, startTime, endTime } = submission.value;

  const { drizzle } = context.hono;

  const result = await drizzle
    .insert(contestsSchema)
    .values([
      {
        id: crypto.randomUUID(), // Generate a unique ID
        title,
        description,
        startTime, // Pass the Date object directly
        endTime // Pass the Date object directly
      }
    ])
    .returning();

  const contest = result[0];

  // Connect to Temporal and start the workflow
  // const connection = await Connection.connect();
  // const client = new Client({ connection });

  // await client.workflow.start("contestWorkflow", {
  //   args: [{ contestId: contest.id, endTime: contest.endTime }],
  //   taskQueue: "contest-queue",
  //   workflowId: `contest-${contest.id}` // ensures idempotency
  // });

  return redirect(`/contests/${contest.id}`);
}

export default function NewContestPage({ actionData }: Route.ComponentProps) {
  const lastResult = actionData;
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldRevalidate: "onBlur"
  });

  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create New Contest</h2>
      <Form method="post" {...getFormProps(form)} className="space-y-4">
        <div>
          <label
            htmlFor={fields.title.id}
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <Input
            className={!fields.title.valid ? "error" : ""}
            {...getInputProps(fields.title, { type: "text" })}
          />
          {!fields.title.valid && (
            <p className="text-red-500 text-sm mt-1">{fields.title.errors}</p>
          )}
        </div>
        <div>
          <label
            htmlFor={fields.description.id}
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <Textarea
            className={!fields.description.valid ? "error" : ""}
            {...getTextareaProps(fields.description)}
            rows={3}
          />
          {!fields.description.valid && (
            <p className="text-red-500 text-sm mt-1">
              {fields.description.errors}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={fields.startTime.id}
            className="block text-sm font-medium text-gray-700"
          >
            Start Time
          </label>
          <Input
            className={!fields.startTime.valid ? "error" : ""}
            {...getInputProps(fields.startTime, { type: "datetime-local" })}
          />
          {!fields.startTime.valid && (
            <p className="text-red-500 text-sm mt-1">
              {fields.startTime.errors}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={fields.endTime.id}
            className="block text-sm font-medium text-gray-700"
          >
            End Time
          </label>
          <Input
            className={!fields.endTime.valid ? "error" : ""}
            {...getInputProps(fields.endTime, { type: "datetime-local" })}
          />
          {!fields.endTime.valid && (
            <p className="text-red-500 text-sm mt-1">{fields.endTime.errors}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/contests")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Contest</Button>
        </div>
      </Form>
    </div>
  );
}
