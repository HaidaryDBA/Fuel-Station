import { useEffect, useState, type ReactNode } from "react";
import apiClient from "../lib/api";
import { initializeStores } from "../utils/storeInitializer";
import { Spinner } from "../components/Loader";
import { useTheme } from "../hooks/useTheme";
import { useDirection } from "../hooks/useDirection";
import i18n from "../utils/i18n";
import { useUserProfileStore } from "../stores/useUserStore";

interface Props {
  children: ReactNode;
}
function AppInitializer({ children }: Props) {
  const [ready, setReady] = useState(false);
  useTheme();
  useDirection();
  const lang = useUserProfileStore((s) => s.userProfile?.preferences.language);
  i18n.init({ lng: lang });
  useEffect(() => {
    const start = async () => {
      const initial_data = (await apiClient.get("/core/initialize")).data;
      initializeStores(initial_data);
      setReady(true);
    };
    start();
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

export default AppInitializer;
