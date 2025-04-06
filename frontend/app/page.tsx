"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [isLoading, setIsLoading] = useState(false);

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

    // Announce to screen readers that the language has been changed
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = `Language set to ${selectedLanguage}. Form loaded.`;
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    updateRandomQuote(newLanguage);

    // Announce to screen readers that the language has been changed
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = `Language changed to ${newLanguage}.`;
    }
  };

  const handleFormSubmit = async (apiResults: ScamDetectionResponse) => {
    setIsLoading(true);

    try {
      setResults(apiResults);
      setCurrentStep("results");

      // Announce to screen readers that results are loaded
      const announcer = document.getElementById("announcer");
      if (announcer) {
        announcer.textContent = `Results loaded. Scam likelihood: ${
          apiResults.scam_likelihood || "unknown"
        }.`;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");

    // Announce to screen readers that we're back to the form
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = `Returned to form.`;
    }
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
      {/* Accessibility announcer for screen readers */}
      <div
        id="announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      {/* Offline indicator */}
      <div
        id="offline-indicator"
        className="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-1 z-50 hidden"
        role="alert"
      >
        You are offline. Some features may be limited.
      </div>

      {/* Script to detect offline status */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('online', function() {
              document.getElementById('offline-indicator').classList.add('hidden');
            });
            window.addEventListener('offline', function() {
              document.getElementById('offline-indicator').classList.remove('hidden');
            });
            if (!navigator.onLine) {
              document.getElementById('offline-indicator').classList.remove('hidden');
            }
          `,
        }}
      />

      {/* Fun background elements with reduced motion preference support */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl motion-safe:animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl motion-safe:animate-pulse motion-safe:animation-delay-1000"></div>
        <div className="absolute bottom-1/3 -left-10 w-40 h-40 rounded-full bg-pink-500/10 blur-3xl motion-safe:animate-pulse motion-safe:animation-delay-2000"></div>
      </div>

      {/* Header with Language Switcher and API Status */}
      {language && currentStep !== "language" && (
        <header
          className="sticky top-0 z-40 backdrop-blur-md bg-gray-900/80 border-b border-gray-800 shadow-md"
          role="banner"
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">
                🛡️
              </span>
              <h1 className="font-bold text-xl">
                <Link href="/" className="focus:outline-none focus:underline">
                  Rent-Spiracy
                </Link>
              </h1>

              {/* API Status Indicator */}
              <div
                className="ml-3 hidden md:flex items-center gap-1"
                aria-live="polite"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus.isConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  aria-hidden="true"
                ></span>
                <span
                  className="text-xs text-gray-400"
                  aria-label={`API Status: ${apiStatus.message}`}
                >
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
      <div className="container mx-auto">
        {isLoading ? (
          <div
            className="flex items-center justify-center min-h-[50vh]"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <div
                className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
                aria-hidden="true"
              ></div>
              <p className="mt-4 text-xl">Processing your request...</p>
              <p className="mt-2 text-sm text-gray-400">
                This may take a moment
              </p>
            </div>
          </div>
        ) : (
          renderCurrentStep()
        )}
      </div>

      {/* Fun quote at the bottom with improved contrast */}
      {randomQuote && currentStep !== "language" && (
        <div className="w-full px-4 py-3 text-center">
          <div className="max-w-3xl mx-auto bg-gray-800/70 p-4 rounded-xl border border-gray-700 italic text-sm text-gray-200">
            &ldquo;{randomQuote}&rdquo;
          </div>
        </div>
      )}

      {/* API Status Footer (mobile) */}
      {apiStatus && language && currentStep !== "language" && (
        <div
          className="md:hidden w-full px-4 py-2 text-center"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-1 text-xs text-gray-300">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.isConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
              aria-hidden="true"
            ></span>
            <span>{apiStatus.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
