import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { Camera } from "lucide-react"; // Import the Camera icon from lucide-react
import { Form } from "react-router";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

interface ContestEntry {
  id: string;
  imageKey: string;
  imageUrl?: string;
  caption: string;
  votes?: number;
  isOwnEntry?: boolean;
}

interface ContestEntryCardProps {
  entry: ContestEntry;
  rotation?: number;
  hasVoted?: boolean;
  simplified?: boolean;
}

export const voteSchema = z.object({
  entryId: z.string().uuid()
});

export function ContestEntryCard({
  entry,
  rotation = 0,
  hasVoted = false,
  simplified = false
}: ContestEntryCardProps) {
  const voteCount = entry.votes ?? 0;
  const [form, { entryId }] = useForm({
    id: `vote-form-${entry.id}`,
    defaultValue: { entryId: entry.id },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: voteSchema });
    }
  });

  return (
    <div className="flex-shrink-0 w-[calc(70vw-2rem)] sm:w-full mx-2 first:ml-4 last:mr-4 sm:mx-0 snap-center">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:rotate-0"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease-in-out"
        }}
      >
        <div className="p-2 sm:p-3">
          <div className="relative pb-[90%] bg-gray-100 rounded-md overflow-hidden">
            {!simplified && entry.isOwnEntry && (
              <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                ⭐️ Your Entry
              </div>
            )}
            {entry.imageUrl ? (
              <img
                src={entry.imageUrl}
                alt={entry.caption}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            )}
            {!simplified && (
              <Form method="post" {...getFormProps(form)}>
                <input {...getInputProps(entryId, { type: "hidden" })} />
                <Button
                  type="submit"
                  name="intent"
                  value="vote"
                  className={`absolute bottom-2 right-2 p-1.5 ${
                    hasVoted
                      ? "bg-red-500 text-white"
                      : "bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  } rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center gap-1`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={hasVoted ? "currentColor" : "none"}
                  />
                  {voteCount > 0 && (
                    <span className="text-xs font-semibold">{voteCount}</span>
                  )}
                </Button>
              </Form>
            )}
          </div>
        </div>
        <div className="p-2 sm:p-3">
          <p className="text-sm sm:text-base md:text-lg text-center font-medium text-gray-800 dark:text-gray-100 font-permanent-marker min-h-[2.8em] max-h-[2.8em] overflow-hidden flex items-center justify-center">
            <span className="line-clamp-2">{entry.caption}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
