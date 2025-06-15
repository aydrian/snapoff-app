import { Outlet, Link } from "react-router";
import { ChevronLeft } from "lucide-react";

export default function ContestsLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            to=".."
            className="flex items-center text-sm text-white hover:text-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white font-permanent-marker">
            📸 SnapOff
          </h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <Outlet />
      </div>
    </div>
  );
}