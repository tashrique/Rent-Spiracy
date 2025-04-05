"use client";

import { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";
import ScamDetectionForm from "../components/ScamDetectionForm";
import ScamDetectionResults from "../components/ScamDetectionResults";

type Language = "english" | "chinese" | "hindi" | "spanish";
type Step = "language" | "form" | "results";

// Mock results for demo purposes
const mockResults = {
  scam_likelihood: "Medium" as const,
  explanation:
    "This listing has some concerning elements. The price is significantly below market average for the area and the landlord is requesting an unusually large deposit via wire transfer.",
  simplified_clauses: [
    {
      text: "Tenant shall pay a security deposit equal to three months' rent via wire transfer within 24 hours of signing this agreement.",
      simplified_text:
        "You must pay 3 months' rent as deposit through wire transfer within 1 day of signing.",
      is_concerning: true,
      reason:
        "Unusually large security deposit and the requirement for wire transfer are red flags.",
    },
    {
      text: "Landlord may enter premises at any time without prior notice for inspection.",
      simplified_text:
        "The landlord can enter your home anytime without telling you first.",
      is_concerning: true,
      reason:
        "This violates standard tenant rights to reasonable notice before entry.",
    },
    {
      text: "The premises shall be used solely as a residence for Tenant(s) named herein.",
      simplified_text:
        "Only the people named in this lease can live in the rental unit.",
      is_concerning: false,
    },
  ],
  suggested_questions: [
    "Can I pay the security deposit after viewing the property in person?",
    "Can we modify the lease to require 24-hour notice before entry?",
    "Is the landlord willing to accept payment methods other than wire transfer?",
    "Can you provide references from current tenants?",
  ],
};

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("language");
  const results = mockResults;

  // For demo purposes, check if localStorage has a language preference
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setCurrentStep("form");
      }
    } catch (error) {
      // Handle the case where localStorage is not available
      console.error("LocalStorage not available:", error);
    }
  }, []);

  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    try {
      localStorage.setItem("language", selectedLanguage);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
    setCurrentStep("form");
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
          <ScamDetectionForm
            language={language}
            onSubmit={() => setCurrentStep("results")}
          />
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
    <main className="min-h-screen bg-gray-900 text-white">
      {renderCurrentStep()}
    </main>
  );
}
