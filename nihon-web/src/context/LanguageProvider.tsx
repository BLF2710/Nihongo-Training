import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, SUPPORTED_LANGUAGES } from "./LanguageContext";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem("app_language");
    const exists = SUPPORTED_LANGUAGES.some((l) => l.id === saved && l.enabled);
    return exists && saved ? saved : "japanese";
  });

  const setLanguage = (langId: string) => {
    const target = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (target && target.enabled) {
      setLanguageState(langId);
      localStorage.setItem("app_language", langId);
    }
  };

  const currentLanguageConfig =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageConfig,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
