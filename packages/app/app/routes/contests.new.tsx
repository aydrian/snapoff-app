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
import { Switch } from "~/components/ui/switch";
import {
  contests as contestsSchema,
  ContestStatus
} from "database/schema/contest.sql";
import { getAnonId } from "~/cookies.server";
import { getSwitchProps } from "~/lib/helper";
import { trpcClient } from "~/lib/trpcClient";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().pipe(z.coerce.date()),
  entryCutoffTime: z.string().pipe(z.coerce.date()),
  votingEndTime: z.string().pipe(z.coerce.date()),
  votesPerUser: z.coerce
    .number()
    .int()
    .min(1, "Votes per user must be at least 1"),
  requireEntryApproval: z.boolean().default(false)
});

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const ownerId = await getAnonId(request);
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const {
    title,
    description,
    startTime,
    entryCutoffTime,
    votingEndTime,
    votesPerUser,
    requireEntryApproval
  } = submission.value;

  const { drizzle } = context.hono;

  const result = await drizzle
    .insert(contestsSchema)
    .values([
      {
        id: crypto.randomUUID(),
        title,
        description,
        startTime,
        entryCutoffTime,
        votingEndTime,
        ownerId,
        votesPerUser,
        requireEntryApproval,
        status: ContestStatus.SCHEDULED,
        createdAt: new Date()
      }
    ])
    .returning();

  const contest = result[0];

  await trpcClient.startContestLifecycle.mutate({
    contestId: contest.id,
    startTime: startTime.getTime(),
    entryCutoffTime: entryCutoffTime.getTime(),
    votingEndTime: votingEndTime.getTime()
  });

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
    <div className="max-w-md mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Contest
        </h2>
        <Form method="post" {...getFormProps(form)} className="space-y-6">
          <div>
            <label
              htmlFor={fields.title.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Title
            </label>
            <Input
              {...getInputProps(fields.title, { type: "text" })}
              className={`w-full ${
                !fields.title.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
            />
            {!fields.title.valid && (
              <p className="text-red-500 text-sm mt-1">{fields.title.errors}</p>
            )}
          </div>
          <div>
            <label
              htmlFor={fields.description.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Description
            </label>
            <Textarea
              {...getTextareaProps(fields.description)}
              rows={3}
              className={`w-full ${
                !fields.description.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Start Time
            </label>
            <Input
              {...getInputProps(fields.startTime, { type: "datetime-local" })}
              className={`w-full ${
                !fields.startTime.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
            />
            {!fields.startTime.valid && (
              <p className="text-red-500 text-sm mt-1">
                {fields.startTime.errors}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={fields.entryCutoffTime.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Entry Cutoff Time
            </label>
            <Input
              {...getInputProps(fields.entryCutoffTime, {
                type: "datetime-local"
              })}
              className={`w-full ${
                !fields.entryCutoffTime.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
            />
            {!fields.entryCutoffTime.valid && (
              <p className="text-red-500 text-sm mt-1">
                {fields.entryCutoffTime.errors}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={fields.votingEndTime.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Voting End Time
            </label>
            <Input
              {...getInputProps(fields.votingEndTime, {
                type: "datetime-local"
              })}
              className={`w-full ${
                !fields.votingEndTime.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
            />
            {!fields.votingEndTime.valid && (
              <p className="text-red-500 text-sm mt-1">
                {fields.votingEndTime.errors}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor={fields.votesPerUser.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Votes Per User
            </label>
            <Input
              {...getInputProps(fields.votesPerUser, { type: "number" })}
              min="1"
              className={`w-full ${
                !fields.votesPerUser.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
            />
            {!fields.votesPerUser.valid && (
              <p className="text-red-500 text-sm mt-1">
                {fields.votesPerUser.errors}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor={fields.requireEntryApproval.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Require Entry Approval
            </label>
            <Switch
              {...getSwitchProps(fields.requireEntryApproval)}
              key={fields.requireEntryApproval.key}
              onCheckedChange={(checked) => {
                form.update({
                  name: fields.requireEntryApproval.name,
                  value: checked
                });
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate("/contests")}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg border-2 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg"
            >
              Create Contest
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
