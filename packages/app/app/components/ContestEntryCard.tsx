import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";

interface ContestEntry {
  id: string;
  imageKey: string;
  imageUrl: string;
  caption: string;
  votes: number;
}

interface ContestEntryCardProps {
  entry: ContestEntry;
  onVote: (entryId: string) => void;
  rotation?: number;
  hasVoted?: boolean;
}

export function ContestEntryCard({
  entry,
  onVote,
  rotation = 0,
  hasVoted = false
}: ContestEntryCardProps) {
  return (
    <div className="flex-shrink-0 w-[calc(70vw-2rem)] sm:w-full mx-2 first:ml-4 last:mr-4 sm:mx-0 snap-center">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-0"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease-in-out"
        }}
      >
        <div className="p-2 sm:p-3">
          <div className="relative pb-[90%] bg-gray-100 rounded-md overflow-hidden">
            <img
              src={entry.imageUrl}
              alt={entry.caption}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <Button
              className={`absolute bottom-2 right-2 p-1.5 ${
                hasVoted
                  ? "bg-red-500 text-white"
                  : "bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
              } rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-110 flex items-center gap-1`}
              onClick={() => onVote(entry.id)}
            >
              <Heart
                className="w-4 h-4"
                fill={hasVoted ? "currentColor" : "none"}
              />
              <span className="text-xs font-semibold">{entry.votes}</span>
            </Button>
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
