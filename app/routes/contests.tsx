import { Outlet, Link } from "react-router";
import { ChevronLeft } from "lucide-react";

export default function ContestsLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <Link
            to=".."
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
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
