"use client";

import { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ScamDetectionForm from "../components/ScamDetectionForm";
import ScamDetectionResults from "../components/ScamDetectionResults";
import { ScamDetectionResponse } from "../services/api";
import apiService from "../services/api";

type Language =
  | "english"
  | "chinese"
  | "hindi"
  | "spanish"
  | "korean"
  | "bengali";
type Step = "language" | "form" | "results";

// Fun quotes about scams in different languages
const funQuotes = {
  english: [
    "If it sounds too good to be true, it probably comes with hidden cameras and a TV host.",
    "Scammers are like bad magicians - once you know the trick, the show's not so impressive.",
    "Remember: Your landlord should fix your leaky faucet, not your lottery tickets.",
    "A good deal shouldn't require your social security number AND your favorite childhood pet's name.",
  ],
  spanish: [
    "Si suena demasiado bueno para ser verdad, probablemente viene con cámaras ocultas y un presentador de televisión.",
    "Los estafadores son como malos magos: una vez que conoces el truco, el espectáculo no es tan impresionante.",
    "Recuerda: tu casero debería arreglar el grifo que gotea, no tus boletos de lotería.",
    "Un buen trato no debería requerir tu número de seguro social Y el nombre de tu mascota favorita de la infancia.",
  ],
  chinese: [
    "如果好得令人难以置信，那可能背后有摄像机和电视主持人。",
    "骗子就像糟糕的魔术师——一旦你知道了诀窍，表演就不那么令人印象深刻了。",
    "记住：房东应该修理漏水的水龙头，而不是彩票。",
    "一个好交易不应该需要你的社会安全号码和你童年最喜欢的宠物的名字。",
  ],
  hindi: [
    "अगर यह सच होने के लिए बहुत अच्छा लगता है, तो शायद इसमें छिपे हुए कैमरे और एक टीवी होस्ट हैं।",
    "घोटालेबाज बुरे जादूगरों की तरह हैं - एक बार जब आप चाल जान लेते हैं, तो शो इतना प्रभावशाली नहीं रहता।",
    "याद रखें: आपके मकान मालिक को आपके रिसते नल को ठीक करना चाहिए, न कि आपके लॉटरी टिकट।",
    "एक अच्छी डील के लिए आपके सोशल सिक्योरिटी नंबर और आपके पसंदीदा बचपन के पालतू जानवर के नाम की आवश्यकता नहीं होनी चाहिए।",
  ],
  korean: [
    "너무 좋아서 사실이라고 믿기 어렵다면, 아마도 숨겨진 카메라와 TV 진행자가 있을 겁니다.",
    "사기꾼은 서투른 마술사와 같습니다 - 일단 트릭을 알면 쇼가 그렇게 인상적이지 않습니다.",
    "기억하세요: 집주인은 당신의 물이 새는 수도꼭지를 고쳐야 하지, 당신의 복권을 고치는 것이 아닙니다.",
    "좋은 거래는 당신의 사회보장번호와 어린 시절 좋아하던 애완동물의 이름을 요구해서는 안 됩니다.",
  ],
  bengali: [
    "যদি এটি সত্যিই খুব ভালো শোনায়, তাহলে সম্ভবত এতে লুকানো ক্যামেরা এবং একজন টিভি হোস্ট আছে।",
    "প্রতারকরা খারাপ জাদুকরদের মতো - একবার আপনি কৌশলটি জেনে গেলে, শোটি তেমন প্রভাবশালী নয়।",
    "মনে রাখবেন: আপনার বাড়িওয়ালা আপনার ফুটো কলের মেরামত করবে, আপনার লটারি টিকিট নয়।",
    "একটি ভালো চুক্তিতে আপনার সোশ্যাল সিকিউরিটি নম্বর এবং আপনার ছোটবেলার প্রিয় পোষা প্রাণীর নাম উভয়ই চাওয়া উচিত নয়।",
  ],
};

// Default mock results in case the API is not available
const defaultMockResults: ScamDetectionResponse = {
  scam_likelihood: "Medium",
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
        const status = await apiService.scamDetection.checkStatus();
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
