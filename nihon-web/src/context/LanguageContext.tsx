import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import type { ReactNode } from "react";

export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "japanese",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    enabled: true
  },
  {
    id: "english",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    enabled: true
  },
  {
    id: "korean",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    enabled: false
  },
  {
    id: "spanish",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    enabled: false
  },
  {
    id: "french",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    enabled: false
  },
  {
    id: "chinese",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    enabled: false
  }
];

interface LanguageContextType {
  language: string;
  currentLanguageConfig: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  setLanguage: (langId: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
