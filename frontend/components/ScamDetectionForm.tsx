"use client";

import { useState } from "react";
import { scamDetectionApi, ScamDetectionResponse } from "../services/api";

interface ScamDetectionFormProps {
  language: string;
  onSubmit: (results: ScamDetectionResponse) => void;
}

export default function ScamDetectionForm({
  language,
  onSubmit,
}: ScamDetectionFormProps) {
  const [listingUrl, setListingUrl] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    english: {
      title: "Check Your Rental Agreement",
      subtitle: "Detect potential scams and problematic clauses in your lease",
      urlLabel: "Listing URL",
      addressLabel: "Property Address",
      fileLabel: "Upload Lease Document",
      fileHelp: "Supported formats: PDF, DOC, DOCX",
      submitButton: "Analyze Now",
      atLeastOneField: "Please provide at least one: URL, address, or document",
      submittingText: "Analyzing... This may take a moment",
      errorText: "An error occurred. Please try again.",
    },
    spanish: {
      title: "Verifica Tu Contrato de Alquiler",
      subtitle:
        "Detecta posibles estafas y cláusulas problemáticas en tu contrato",
      urlLabel: "URL del Anuncio",
      addressLabel: "Dirección de la Propiedad",
      fileLabel: "Cargar Documento de Contrato",
      fileHelp: "Formatos soportados: PDF, DOC, DOCX",
      submitButton: "Analizar Ahora",
      atLeastOneField:
        "Por favor proporciona al menos uno: URL, dirección o documento",
      submittingText: "Analizando... Esto puede tomar un momento",
      errorText: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    },
    chinese: {
      title: "检查您的租赁协议",
      subtitle: "检测租约中潜在的诈骗和问题条款",
      urlLabel: "房源链接",
      addressLabel: "房产地址",
      fileLabel: "上传租约文件",
      fileHelp: "支持的格式：PDF、DOC、DOCX",
      submitButton: "立即分析",
      atLeastOneField: "请至少提供以下之一：链接、地址或文件",
      submittingText: "分析中...这可能需要一点时间",
      errorText: "发生错误。请再试一次。",
    },
    hindi: {
      title: "अपने किराया अनुबंध की जांच करें",
      subtitle:
        "अपने लीज़ में संभावित धोखाधड़ी और समस्याग्रस्त खंडों का पता लगाएं",
      urlLabel: "लिस्टिंग यूआरएल",
      addressLabel: "संपत्ति का पता",
      fileLabel: "लीज़ दस्तावेज़ अपलोड करें",
      fileHelp: "समर्थित प्रारूप: PDF, DOC, DOCX",
      submitButton: "अभी विश्लेषण करें",
      atLeastOneField: "कृपया कम से कम एक प्रदान करें: URL, पता, या दस्तावेज़",
      submittingText: "विश्लेषण हो रहा है... इसमें कुछ समय लग सकता है",
      errorText: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    },
    korean: {
      title: "임대 계약서 확인하기",
      subtitle: "임대 계약서의 잠재적 사기와 문제가 있는 조항 탐지",
      urlLabel: "매물 URL",
      addressLabel: "부동산 주소",
      fileLabel: "임대 계약서 업로드",
      fileHelp: "지원 형식: PDF, DOC, DOCX",
      submitButton: "지금 분석하기",
      atLeastOneField: "URL, 주소 또는 문서 중 하나 이상을 제공해주세요",
      submittingText: "분석 중... 잠시 기다려주세요",
      errorText: "오류가 발생했습니다. 다시 시도해주세요.",
    },
    bengali: {
      title: "আপনার ভাড়ার চুক্তি যাচাই করুন",
      subtitle: "আপনার লিজে সম্ভাব্য প্রতারণা এবং সমস্যাযুক্ত ধারা সনাক্ত করুন",
      urlLabel: "লিস্টিং URL",
      addressLabel: "সম্পত্তির ঠিকানা",
      fileLabel: "লিজ ডকুমেন্ট আপলোড করুন",
      fileHelp: "সমর্থিত ফরম্যাট: PDF, DOC, DOCX",
      submitButton: "এখনই বিশ্লেষণ করুন",
      atLeastOneField: "অনুগ্রহ করে কমপক্ষে একটি দিন: URL, ঠিকানা, বা ডকুমেন্ট",
      submittingText: "বিশ্লেষণ করা হচ্ছে... এটি কিছুক্ষণ সময় নিতে পারে",
      errorText: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    },
  };

  const t =
    translations[language as keyof typeof translations] || translations.english;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate at least one field is provided
    if (!listingUrl && !address && !selectedFile) {
      setError(t.atLeastOneField);
      return;
    }

    setIsSubmitting(true);

    try {
      let fileContent = "";

      // Handle file if it exists
      if (selectedFile) {
        const reader = new FileReader();
        fileContent = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === "string") {
              resolve(event.target.result);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(selectedFile);
        });
      }

      // Send data to API
      const response = await scamDetectionApi.analyzeRental({
        listingUrl: listingUrl || undefined,
        address: address || undefined,
        fileContent: fileContent || undefined,
      });

      // For development/demo, if the backend isn't available, use mock results
      onSubmit(response);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(t.errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-block relative mb-2">
          <span className="text-4xl animate-float inline-block">🕵️</span>
          <span className="absolute top-0 right-0 text-2xl animate-pulse-slow">
            🔍
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
        <p className="text-gray-300">{t.subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md backdrop-blur-sm border border-gray-700 relative overflow-hidden"
      >
        {/* Fun decoration elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-blue-500/20 blur-xl animate-float"></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-pink-500/20 blur-xl animate-pulse-slow"></div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="listingUrl"
          >
            {t.urlLabel}
          </label>
          <div className="relative">
            <input
              id="listingUrl"
              type="url"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://"
            />
            {listingUrl && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                🔗
              </span>
            )}
          </div>
        </div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="address"
          >
            {t.addressLabel}
          </label>
          <div className="relative">
            <input
              id="address"
              type="text"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {address && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                📍
              </span>
            )}
          </div>
        </div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="fileUpload"
          >
            <div className="flex items-center gap-1">
              {t.fileLabel}
              <span className="text-lg animate-float inline-block">📄</span>
            </div>
          </label>
          <input
            id="fileUpload"
            type="file"
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white file:text-white file:bg-blue-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:hover:bg-blue-600 transition-all"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-1">{t.fileHelp}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-200 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-300">{t.atLeastOneField}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden"
        >
          <span className="relative z-10">
            {isSubmitting ? <span>{t.submittingText}</span> : t.submitButton}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 transition-colors duration-200"></span>
        </button>
      </form>
    </div>
  );
}
