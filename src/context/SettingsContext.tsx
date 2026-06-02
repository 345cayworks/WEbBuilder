import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { SystemSettings } from "@/types";
import { defaultSettings } from "@/lib/constants";
import { localStore, KEYS } from "@/lib/storage";

interface SettingsContextValue {
  settings: SystemSettings;
  updateSettings: (patch: Partial<SystemSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const stored = localStore.get<Partial<SystemSettings> | null>(KEYS.settings, null);
    return stored ? { ...defaultSettings(), ...stored } : defaultSettings();
  });

  const updateSettings = useCallback((patch: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStore.set(KEYS.settings, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const next = defaultSettings();
    localStore.set(KEYS.settings, next);
    setSettings(next);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
