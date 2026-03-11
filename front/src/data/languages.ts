export interface Language {
  label: string;
  code: string;
  dir: "ltr" | "rtl";
}

export const languages: Language[] = [
  {
    label: "English",
    code: "en",
    dir: "ltr"
  },
  {
    label: "Dari",
    code: "da",
    dir: "rtl"
  },
  {
    label: "Pashto",
    code: "pa",
    dir: "rtl"
  },
]