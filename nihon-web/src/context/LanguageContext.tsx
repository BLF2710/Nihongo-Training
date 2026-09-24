import {
  createContext,
  useContext
} from "react";

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

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
