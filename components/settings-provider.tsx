"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  siteName: string;
  siteTitle: string;
  description: string;
  contactEmail: string;
  maintenanceMode: boolean;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {
    siteName: "CryptoEdu",
    siteTitle: "Learn Crypto Trading",
    description: "Your platform for crypto education",
    contactEmail: "contact@cryptoedu.com",
    maintenanceMode: false,
  },
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "CryptoEdu",
    siteTitle: "Learn Crypto Trading",
    description: "Your platform for crypto education",
    contactEmail: "contact@cryptoedu.com",
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
