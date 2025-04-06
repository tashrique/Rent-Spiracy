"use client";

import { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ScamDetectionForm from "../components/ScamDetectionForm";
import ScamDetectionResults from "../components/ScamDetectionResults";
import { ScamDetectionResponse, Language } from "../services/api";
import { api } from "../services/api";
import { defaultMockResults, funQuotes } from "../services/constants";

type Step = "language" | "form" | "results";

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("language");
  const [randomQuote, setRandomQuote] = useState("");
  const [results, setResults] =
    useState<ScamDetectionResponse>(defaultMockResults);
  const [apiStatus, setApiStatus] = useState<{
    isConnected: boolean;
    message: string;
  }>({
    isConnected: false,
    message: "Checking API connection...",
  });

  // Check API connection on load
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const status = await api.scamDetection.checkStatus();
        setApiStatus({
          isConnected: true,
          message: status.message,
        });
      } catch (error) {
        console.error("API connection error:", error);
        setApiStatus({
          isConnected: false,
          message: "Using demo mode - API not available",
        });
      }
    };

    checkApiConnection();
  }, []);

  // Update random quote when language changes
  const updateRandomQuote = (lang: Language) => {
    const quotes = funQuotes[lang] || funQuotes.english;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomIndex]);
  };

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    updateRandomQuote(selectedLanguage);
    setCurrentStep("form");
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    updateRandomQuote(newLanguage);
  };

  const handleFormSubmit = (apiResults: ScamDetectionResponse) => {
    setResults(apiResults);
    setCurrentStep("results");
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  // Determine which component to render based on the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "language":
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
      case "form":
        if (!language) return <div>Language not selected</div>;

        return (
          <ScamDetectionForm language={language} onSubmit={handleFormSubmit} />
        );
      case "results":
        if (!language) return <div>Language not selected</div>;

        return (
          <ScamDetectionResults
            language={language}
            results={results}
            onBack={handleBackToForm}
          />
        );
      default:
        return <div>Something went wrong</div>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white relative">
      {/* Fun background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-10 w-40 h-40 rounded-full bg-pink-500/10 blur-3xl"></div>
      </div>

      {/* Header with Language Switcher and API Status */}
      {language && currentStep !== "language" && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="font-bold text-xl">Rent-Spiracy</h1>

              {/* API Status Indicator */}
              <div className="ml-3 hidden md:flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus.isConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></span>
                <span className="text-xs text-gray-400">
                  {apiStatus.message}
                </span>
              </div>
            </div>
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </header>
      )}

      {/* Main content */}
      <div className="container mx-auto">{renderCurrentStep()}</div>

      {/* Fun quote at the bottom */}
      {randomQuote && currentStep !== "language" && (
        <div className="w-full px-4 py-3 text-center">
          <div className="max-w-3xl mx-auto bg-gray-800/50 p-4 rounded-xl border border-gray-700 italic text-sm text-gray-300">
            &ldquo;{randomQuote}&rdquo;
          </div>
        </div>
      )}

      {/* API Status Footer (mobile) */}
      {apiStatus && language && currentStep !== "language" && (
        <div className="md:hidden w-full px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.isConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></span>
            <span>{apiStatus.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
