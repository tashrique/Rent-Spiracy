"use client";

import { Language } from "../services/api";
import { useEffect, useRef } from "react";

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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus the heading when component mounts for screen readers
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation within the language grid
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const buttons =
      document.querySelectorAll<HTMLButtonElement>(".language-button");
    const lastIndex = buttons.length - 1;

    switch (e.key) {
      case "ArrowRight":
        if (index < lastIndex) {
          buttons[index + 1].focus();
        }
        break;
      case "ArrowLeft":
        if (index > 0) {
          buttons[index - 1].focus();
        }
        break;
      case "ArrowUp":
        if (index - 2 >= 0) {
          buttons[index - 2].focus();
        }
        break;
      case "ArrowDown":
        if (index + 2 <= lastIndex) {
          buttons[index + 2].focus();
        }
        break;
      case "Home":
        buttons[0].focus();
        break;
      case "End":
        buttons[lastIndex].focus();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 pt-4 pb-8"
      role="region"
      aria-labelledby="language-heading"
      id="main-content"
    >
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-2 text-white pt-20"
          id="language-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          Welcome to Rent-Spiracy
        </h1>
        <p className="text-xl text-gray-300">
          Please select your preferred language
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl"
        role="radiogroup"
        aria-labelledby="language-heading"
      >
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => onLanguageSelect(lang.code)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="language-button flex items-center p-4 md:p-6 border border-gray-700 rounded-xl bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            aria-label={`Select ${lang.name} (${lang.nativeName})`}
            role="radio"
            aria-checked="false"
          >
            <span className="text-3xl md:text-4xl mr-4" aria-hidden="true">
              {lang.flag}
            </span>
            <div className="text-left">
              <p className="font-medium text-base md:text-lg text-white">
                {lang.name}
              </p>
              <p className="text-sm md:text-base text-gray-300">
                {lang.nativeName}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Added help text for screen readers */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between language options and press Enter to
        select.
      </div>
    </div>
  );
}
