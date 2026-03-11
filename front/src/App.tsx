import { ConfirmDialog } from "primereact/confirmdialog";
import AppRouterProvider from "./providers/AppRouterProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ToastProvider } from "./providers/ToastProvider";
import ErrorBoundary from "./providers/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { directionMap, type SupportedLang } from "./utils/directions";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language as SupportedLang;
    const dir = directionMap[lang] ?? "ltr";

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [i18n.language]);
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppRouterProvider />
        <ToastProvider />
        <ConfirmDialog />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
