import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function SplashPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">📸 SnapOff</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Join photo contests. Show your best shot. Win the vote.
      </p>
      <Link to="/contests">
        <Button size="lg">View Contests</Button>
      </Link>
    </div>
  );
}
