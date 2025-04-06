"use client";

import { useState, useEffect } from "react";
import { Lawyer } from "@/services/api";
import { lawyers as MOCK_LAWYERS } from "@/services/constants";

interface LawyerSectionProps {
  language: string;
}

export default function LawyerSection({ language }: LawyerSectionProps) {
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  // Load lawyer data from mock
  useEffect(() => {
    setIsLoadingLawyers(true);
    // Use mock data instead of API calls
    const mockLawyersForLanguage =
      MOCK_LAWYERS[language as keyof typeof MOCK_LAWYERS] || [];

    // Add id field to each lawyer if not present
    const lawyersWithIds = mockLawyersForLanguage.map((lawyer, index) => ({
      id: lawyer.email.split("@")[0] || `mock-lawyer-${index}`,
      ...lawyer,
    }));

    setLawyers(lawyersWithIds as Lawyer[]);
    setIsLoadingLawyers(false);
  }, [language]);

  // Translation functions
  const getBackToListText = () => {
    const texts: { [key: string]: string } = {
      english: "Back to List",
      spanish: "Volver a la Lista",
      chinese: "返回列表",
      hindi: "सूची पर वापस जाएं",
      korean: "목록으로 돌아가기",
      bengali: "তালিকায় ফিরে যান",
      swahili: "Rudi kwenye Orodha",
      arabic: "العودة إلى القائمة",
    };
    return texts[language as keyof typeof texts] || "Back to List";
  };

  const getWebsiteText = () => {
    const texts: { [key: string]: string } = {
      english: "Website",
      spanish: "Sitio Web",
      chinese: "网站",
      hindi: "वेबसाइट",
      korean: "웹사이트",
      bengali: "ওয়েবসাইট",
      swahili: "Tovuti",
      arabic: "موقع الكتروني",
    };
    return texts[language as keyof typeof texts] || "Website";
  };

  const getCloseText = () => {
    const texts: { [key: string]: string } = {
      english: "Close",
      spanish: "Cerrar",
      chinese: "关闭",
      hindi: "बंद करें",
      korean: "닫기",
      bengali: "বন্ধ করুন",
      swahili: "Funga",
      arabic: "إغلاق",
    };
    return texts[language as keyof typeof texts] || "Close";
  };

  const getLocationText = () => {
    const texts: { [key: string]: string } = {
      english: "Location",
      spanish: "Ubicación",
      chinese: "位置",
      hindi: "स्थान",
      korean: "위치",
      bengali: "অবস্থান",
      swahili: "Eneo",
      arabic: "الموقع",
    };
    return texts[language as keyof typeof texts] || "Location";
  };

  const getLanguagesText = () => {
    const texts: { [key: string]: string } = {
      english: "Languages",
      spanish: "Idiomas",
      chinese: "语言",
      hindi: "भाषाएँ",
      korean: "언어",
      bengali: "ভাষা",
      swahili: "Lugha",
      arabic: "اللغات",
    };
    return texts[language as keyof typeof texts] || "Languages";
  };

  const getConsultationText = () => {
    const texts: { [key: string]: string } = {
      english: "Free Consultation",
      spanish: "Consulta Gratuita",
      chinese: "免费咨询",
      hindi: "मुफ्त परामर्श",
      korean: "무료 상담",
      bengali: "বিনামূল্যে পরামর্শ",
      swahili: "Ushauri wa Bure",
      arabic: "استشارة مجانية",
    };
    return texts[language as keyof typeof texts] || "Free Consultation";
  };

  const formatLanguages = (languageList: string[]) => {
    if (!languageList || languageList.length === 0) return "—";

    // Format language list differently based on current UI language
    if (language === "english") {
      return languageList.join(", ");
    }

    const currentLangName =
      {
        english: "English",
        spanish: "Spanish",
        chinese: "Chinese",
        hindi: "Hindi",
        korean: "Korean",
        bengali: "Bengali",
        swahili: "Swahili",
        arabic: "Arabic",
      }[language] || language;

    // Put the current language at the beginning if it exists in the list
    const sortedList = [...languageList].sort((a, b) =>
      a === currentLangName ? -1 : b === currentLangName ? 1 : 0
    );

    return sortedList.join(", ");
  };

  const getLawyerSectionTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Talk to a Lawyer",
      spanish: "Hablar con un Abogado",
      chinese: "咨询律师",
      hindi: "वकील से बात करें",
      korean: "변호사와 상담하기",
      bengali: "আইনজীবীর সাথে কথা বলুন",
      swahili: "Zungumza na Wakili",
      arabic: "تحدث مع محام",
    };
    return texts[language as keyof typeof texts] || "Talk to a Lawyer";
  };

  const getLawyerSectionDescription = () => {
    const descriptions: { [key: string]: string } = {
      english: `Want to talk to a real lawyer? Here are ${
        lawyers.length
      } options in your area who speak English${
        language !== "english" ? " and " + getLanguageDisplayName() : ""
      }.`,
      spanish: `¿Quiere hablar con un abogado real? Aquí hay ${lawyers.length} opciones en su área que hablan español.`,
      chinese: `想与真正的律师交谈？这里有${lawyers.length}位在您所在地区会说中文的选择。`,
      hindi: `क्या आप एक वास्तविक वकील से बात करना चाहते हैं? यहां आपके क्षेत्र में ${lawyers.length} विकल्प हैं जो हिंदी बोलते हैं।`,
      korean: `실제 변호사와 상담하고 싶으신가요? 한국어를 구사하는 지역 내 ${lawyers.length}가지 옵션이 있습니다.`,
      bengali: `একজন আসল আইনজীবীর সাথে কথা বলতে চান? এখানে আপনার এলাকায় ${lawyers.length}টি বিকল্প রয়েছে যারা বাংলা বলেন।`,
      swahili: `Unataka kuzungumza na wakili halisi? Hapa kuna chaguo ${lawyers.length} katika eneo lako zinazozungumza Kiswahili.`,
      arabic: `هل ترغب في التحدث مع محام حقيقي؟ إليك ${lawyers.length} خيارات في منطقتك يتحدثون العربية.`,
    };

    return (
      descriptions[language as keyof typeof descriptions] ||
      descriptions.english
    );
  };

  const getLanguageDisplayName = () => {
    const names: { [key: string]: string } = {
      english: "English",
      spanish: "Spanish",
      chinese: "Chinese",
      hindi: "Hindi",
      korean: "Korean",
      bengali: "Bengali",
      swahili: "Swahili",
      arabic: "Arabic",
    };
    return names[language as keyof typeof names] || language;
  };

  const getTalkToLawyerButtonText = () => {
    const texts: { [key: string]: string } = {
      english: "Find a Lawyer",
      spanish: "Encontrar un Abogado",
      chinese: "寻找律师",
      hindi: "वकील ढूंढें",
      korean: "변호사 찾기",
      bengali: "আইনজীবী খুঁজুন",
      swahili: "Tafuta Wakili",
      arabic: "ابحث عن محام",
    };
    return texts[language as keyof typeof texts] || "Find a Lawyer";
  };

  const getViewProfileText = () => {
    const texts: { [key: string]: string } = {
      english: "View Profile",
      spanish: "Ver Perfil",
      chinese: "查看资料",
      hindi: "प्रोफ़ाइल देखें",
      korean: "프로필 보기",
      bengali: "প্রোফাইল দেখুন",
      swahili: "Tazama Wasifu",
      arabic: "عرض الملف الشخصي",
    };
    return texts[language as keyof typeof texts] || "View Profile";
  };

  return (
    <div className="mb-8">
      {/* Improved Lawyer Recommendations Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-md border border-gray-700 group hover:border-blue-500 transition-colors duration-300 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>

        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
          <span className="text-2xl">⚖️</span>
          {getLawyerSectionTitle()}
        </h2>

        <p className="text-gray-300 mb-6">{getLawyerSectionDescription()}</p>

        <div className="mt-4 text-center">
          <button
            onClick={() => setShowLawyerModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2 px-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          >
            {getTalkToLawyerButtonText()}
          </button>
        </div>
      </div>

      {/* Lawyer Modal */}
      {showLawyerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-2xl font-bold text-white">
                  {getLawyerSectionTitle()}
                </h3>
                <button
                  onClick={() => {
                    setShowLawyerModal(false);
                    setSelectedLawyer(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {selectedLawyer ? (
                <div className="animate-fadeIn">
                  <button
                    onClick={() => setSelectedLawyer(null)}
                    className="mb-4 text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>←</span> {getBackToListText()}
                  </button>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-white mx-auto md:mx-0">
                        {selectedLawyer.pictureUrl ? (
                          <img
                            src={selectedLawyer.pictureUrl}
                            alt={selectedLawyer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedLawyer.name.charAt(0)
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-2 text-center md:text-left">
                          {selectedLawyer.name}
                        </h4>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm">
                            {selectedLawyer.specialization}
                          </span>
                          {selectedLawyer.freeDuration && (
                            <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm">
                              {getConsultationText()}:{" "}
                              {selectedLawyer.freeDuration}
                            </span>
                          )}
                          <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            {selectedLawyer.rating || 4.5}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h5 className="text-gray-400 text-sm mb-1">
                              {getLocationText()}
                            </h5>
                            <p className="text-white">
                              {selectedLawyer.location} ({selectedLawyer.region}
                              )
                            </p>
                          </div>
                          <div>
                            <h5 className="text-gray-400 text-sm mb-1">
                              {getLanguagesText()}
                            </h5>
                            <p className="text-white">
                              {formatLanguages(selectedLawyer.languages)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                          <a
                            href={`tel:${selectedLawyer.phone}`}
                            className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                          >
                            <span>📞</span> {selectedLawyer.phone}
                          </a>
                          <a
                            href={`mailto:${selectedLawyer.email}`}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                          >
                            <span>✉️</span> {selectedLawyer.email}
                          </a>
                          {selectedLawyer.website && (
                            <a
                              href={`https://${selectedLawyer.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                            >
                              <span>🌐</span> {getWebsiteText()}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {isLoadingLawyers ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : lawyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lawyers.map((lawyer) => (
                        <div
                          key={lawyer.id}
                          className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-4 transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedLawyer(lawyer)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                              {lawyer.pictureUrl ? (
                                <img
                                  src={lawyer.pictureUrl}
                                  alt={lawyer.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                lawyer.name.charAt(0)
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold text-white">
                                  {lawyer.name}
                                </h4>
                                <div className="flex items-center gap-1 bg-gray-700 px-2 py-0.5 rounded-full">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm text-gray-300">
                                    {lawyer.rating || 4.0}
                                  </span>
                                </div>
                              </div>

                              <p className="text-blue-300 text-sm">
                                {lawyer.specialization}
                              </p>
                              <p className="text-gray-400 text-sm mb-2">
                                {lawyer.location}{" "}
                                <span className="text-xs">
                                  ({lawyer.region})
                                </span>
                              </p>

                              <button
                                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 w-full justify-center mt-2 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLawyer(lawyer);
                                }}
                              >
                                {getViewProfileText()} →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="text-gray-300 text-lg mb-4">
                        No lawyers found for your language preferences.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 text-center pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowLawyerModal(false);
                    setSelectedLawyer(null);
                  }}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {getCloseText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
