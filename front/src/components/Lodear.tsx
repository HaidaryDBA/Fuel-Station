import { useTranslation } from "react-i18next";

// Amazing First-Time Loader
export default function AmazingLoader() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/40 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main loader content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto relative">
            {/* Rotating outer ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin" />

            {/* Pulsing inner circle */}
            <div className="absolute inset-2 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 animate-ping" />
            </div>
          </div>
        </div>

        {/* Animated text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl mb-8 font-bold text-white animate-fade-in">
            {t("slide1Title")}{" "}
          </h1>

          {/* Loading bar */}
          <div className="w-64 h-2 mx-auto bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-accent via-white to-accent animate-loading-bar" />
          </div>

          <p className="text-white/90 text-lg animate-fade-in delay-300">
            {t("BeingProcessed")}
          </p>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
