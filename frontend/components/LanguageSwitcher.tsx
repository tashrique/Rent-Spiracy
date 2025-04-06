"use client";

import { useState } from "react";

type Language =
  | "english"
  | "chinese"
  | "hindi"
  | "spanish"
  | "korean"
  | "bengali"
  | "swahili"
  | "arabic";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: "english",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "spanish",
    name: "Español",
    flag: "🇪🇸",
  },
  {
    code: "chinese",
    name: "中文",
    flag: "🇨🇳",
  },
  {
    code: "hindi",
    name: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "korean",
    name: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "bengali",
    name: "বাংলা",
    flag: "🇧🇩",
  },
  {
    code: "swahili",
    name: "Kiswahili",
    flag: "🇹🇿",
  },
  {
    code: "arabic",
    name: "العربية",
    flag: "🇸🇦",
  },
];

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  return (
    <div className="relative">
      {/* Language button with current selection */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-300 border border-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="text-white text-sm font-medium hidden sm:inline-block">
          {currentLang.name}
        </span>
        <span className="text-xs text-gray-300">▼</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl animate-bounceIn">
          <ul className="space-y-1 min-w-[120px]">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                    lang.code === currentLanguage
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-700 text-gray-200"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm">{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
