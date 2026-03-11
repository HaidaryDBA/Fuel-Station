import { useEffect, useState } from "react";
import { applyTheme, getSavedTheme, type Theme } from "../services/theme";
import { useUserProfileStore } from "../stores/useUserStore";

export function useTheme(): {
  theme: Theme;
  updateTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const t = useUserProfileStore((s) => s.userProfile?.preferences.theme);
  const [theme, setTheme] = useState<Theme>(t || getSavedTheme());
  applyTheme(theme);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = (document.documentElement.getAttribute("data-theme") ||
        "dark") as Theme;
      setTheme(theme);
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const updateTheme = (theme: Theme) => {
    applyTheme(theme);
    setTheme(theme);
  };
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updateTheme(newTheme);
  };
  return { theme, updateTheme, toggleTheme };
}
