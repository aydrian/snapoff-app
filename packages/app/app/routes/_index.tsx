import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import FlyingEmojis from "~/components/FlyingEmojis";

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 overflow-hidden">
      <FlyingEmojis />
      <h1 className="text-6xl font-permanent-marker mb-6 text-white relative z-10">
        📸 SnapOff
      </h1>
      <p className="text-xl text-white mb-8 animate-fadeIn animate-delay-500 animate-duration-1000 relative z-10">
        Join photo contests. Show your best shot. Win the vote.
      </p>
      <Link to="/contests" className="relative z-10" viewTransition>
        <Button
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg animate-pulse animate-infinite animate-duration-2000"
        >
          View Contests
        </Button>
      </Link>
    </div>
  );
}
