import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className=" bg-background flex items-center justify-center p-4">
      <div className=" w-full  rounded-2xl shadow-xl p-8 md:p-12">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-60"></div>
            <div className="relative bg-red-50 p-6 rounded-full">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl font-bold text-slate-800 mb-4">404</h1>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-slate-700 mb-3">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-lg mb-8 max-w-md">
            Sorry, we couldn't find the page you're looking for. The page may
            have been moved, deleted, or the URL might be incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Home className="w-5 h-5" />
              Home Page
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-slate-200 w-full">
            <p className="text-slate-500 text-sm mb-4">
              Need help finding something?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/contact"
                className="text-red-500 hover:text-red-600 hover:underline"
              >
                Contact Support
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="/sitemap"
                className="text-red-500 hover:text-red-600 hover:underline"
              >
                View Sitemap
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="/search"
                className="text-red-500 hover:text-red-600 hover:underline"
              >
                Search Site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
