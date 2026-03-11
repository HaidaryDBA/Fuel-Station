export type Theme = "light" | "dark" | "system";

export const themes: Theme[] = ["light", "dark", "system"];

export const setTheme = (theme: Theme) => {
  let t = theme;
  if (theme === "system") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    t = mediaQuery.matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
  return t;
};

export const applyTheme = (theme: Theme) => {
  const t = setTheme(theme);
  localStorage.setItem("color-theme", t);
};

export const getSavedTheme = (): Theme => {
  const saved = localStorage.getItem("color-theme") as Theme | null;
  if (saved && themes.includes(saved)) return saved;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};
