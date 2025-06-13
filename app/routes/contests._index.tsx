import type { Route } from "./+types/contests._index";
import { Link } from "react-router";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { contests as contestsSchema } from "database/schema/contest.sql";

export async function loader({ context }: Route.LoaderArgs) {
  const { drizzle } = context.hono;
  const contests = await drizzle.select().from(contestsSchema);
  return { contests };
}

export default function ContestsPage({ loaderData }: Route.ComponentProps) {
  const { contests } = loaderData;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Active Contests</h2>
        <Link to="/contests/new">
          <Button>Create Contest</Button>
        </Link>
      </div>
      {contests.length === 0 ? (
        <p className="text-muted-foreground">
          No contests available right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contests.map((contest) => (
            <Link to={`/contests/${contest.id}`} key={contest.id}>
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <CardTitle>{contest.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {contest.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
