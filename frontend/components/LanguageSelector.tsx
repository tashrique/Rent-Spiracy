"use client";

import { Language } from "../services/api";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  {
    code: "english",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "spanish",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  {
    code: "chinese",
    name: "Chinese (Simplified)",
    nativeName: "中文",
    flag: "🇨🇳",
  },
  {
    code: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
  },
  {
    code: "swahili",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "🇹🇿",
  },
  {
    code: "korean",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "arabic",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
  },
];

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
}

export default function LanguageSelector({
  onLanguageSelect,
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white pt-20">
          Welcome to Rent-Spiracy
        </h1>
        <p className="text-xl text-gray-300">
          Please select your preferred language
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageSelect(lang.code)}
            className="flex items-center p-6 border border-gray-700 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span className="text-4xl mr-4">{lang.flag}</span>
            <div className="text-left">
              <p className="font-medium text-lg text-white">{lang.name}</p>
              <p className="text-gray-300">{lang.nativeName}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
