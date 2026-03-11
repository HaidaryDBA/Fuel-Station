import type { InitialResponse } from "../entities/InitialResponse";
import { useSettingsStore } from "../stores/useSettingsStore";

export const initializeStores = (initial_data: InitialResponse) => {
  const setSettings = useSettingsStore.getState().setSettings;

  setSettings(initial_data.settings);
};
