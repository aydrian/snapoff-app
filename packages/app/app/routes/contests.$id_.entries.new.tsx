import { useParams, Form, useNavigate } from "react-router";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/contests.$id_.entries.new";
import { entries } from "database/schema/contest.sql";
import { getAnonId } from "~/cookies.server";
import { ContestEntryCard } from "~/components/ContestEntryCard";
import { Camera } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const schema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB."),
  caption: z.string().max(100, "Caption must be 100 characters or less")
});

export async function action({ request, params, context }: Route.ActionArgs) {
  const { drizzle } = context.hono;
  const { snapoff_assets } = context.cloudflare.env;
  const userId = await getAnonId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { image, caption } = submission.value;

  try {
    // Generate a unique filename for the image
    const fileExtension = image.name.split(".").pop();
    const imageKey = `${crypto.randomUUID()}.${fileExtension}`;

    // Upload the image to R2
    await snapoff_assets.put(imageKey, image, {
      httpMetadata: {
        contentType: image.type
      }
    });

    // Save the entry details in the database
    const [newEntry] = await drizzle
      .insert(entries)
      .values({
        id: crypto.randomUUID(),
        contestId: params.id,
        imageKey,
        caption,
        userId,
        createdAt: new Date()
      })
      .returning();

    // Redirect to the contest page after successful submission
    return new Response(null, {
      status: 302,
      headers: { Location: `/contests/${params.id}` }
    });
  } catch (error) {
    console.error("Error saving entry:", error);
    // Handle any errors that occur during saving
    return submission.reply({
      formErrors: ["Failed to save the entry. Please try again."]
    });
  }
}

export default function NewEntryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fileInput = fileInputRef.current;
    const fileButton = fileButtonRef.current;

    if (fileInput && fileButton) {
      const handleButtonClick = (e: MouseEvent) => {
        e.preventDefault();
        fileInput.click();
      };

      fileButton.addEventListener("click", handleButtonClick);

      return () => {
        fileButton.removeEventListener("click", handleButtonClick);
      };
    }
  }, []);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur"
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(undefined);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Entry
        </h2>
        <Form
          method="post"
          {...getFormProps(form)}
          className="space-y-6"
          encType="multipart/form-data"
        >
          <ContestEntryCard
            entry={{
              id: "new-entry",
              imageKey: "new-entry",
              caption,
              imageUrl: previewUrl
            }}
            simplified
          />
          <div className="relative">
            <input
              ref={fileInputRef}
              {...getInputProps(fields.image, { type: "file" })}
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
              aria-label="Select Snapshot"
            />
            <Button
              ref={fileButtonRef}
              type="button"
              className="w-full flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="js-file-button-text">
                {previewUrl ? "Change Snapshot" : "Select Snapshot"}
              </span>
            </Button>
            {!fields.image.valid && (
              <p className="text-red-500 text-sm mt-1">{fields.image.errors}</p>
            )}
          </div>
          <div>
            <label
              htmlFor={fields.caption.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Caption (optional)
            </label>
            <Textarea
              {...getTextareaProps(fields.caption)}
              placeholder="Add a caption for your entry"
              className={`w-full ${
                !fields.caption.valid
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:ring-primary focus:border-primary`}
              onChange={(e) => setCaption(e.target.value)}
            />
            {!fields.caption.valid && (
              <p className="text-red-500 text-sm mt-1">
                {fields.caption.errors}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/contests/${params.id}`)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.valid || !previewUrl}
              className="w-full sm:w-auto"
            >
              Submit Entry
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
