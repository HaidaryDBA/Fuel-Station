// hooks/useDirection.ts
import { useEffect, useState } from "react";
import { languages } from "../data/languages";
import { useUserProfileStore } from "../stores/useUserStore";

export function useDirection(): "ltr" | "rtl" {
  const lang = useUserProfileStore((s) => s.userProfile?.preferences.language);
  const d = languages.find((l) => l.code === lang)?.dir;
  const di = d || localStorage.getItem("dir");
  const [dir, setDir] = useState<"ltr" | "rtl">(
    di ? (di === "rtl" ? "rtl" : "ltr") : "ltr"
  );
  document.documentElement.setAttribute("dir", dir);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDir(document.documentElement.dir === "rtl" ? "rtl" : "ltr");
      localStorage.setItem("dir", document.documentElement.dir);
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return dir;
}
