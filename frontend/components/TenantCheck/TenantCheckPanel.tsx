"use client";

import { useState } from "react";
import { api, SuspectLeaser, Language } from "../../services/api";
import { Disclosure } from "@headlessui/react";
import { tenantCheckTranslations } from "../../services/constants";
import ReportModal from "./ReportModal";

interface TenantCheckPanelProps {
  language?: Language;
}

// Function to translate flag texts based on detection patterns
function translateFlag(flag: string, language: Language): string {
  // Common scam patterns to detect and translate
  const scamPatterns = {
    english: {
      "multiple reported scams": "multiple reported scams",
      "non-existent properties": "non-existent properties",
      "asks for wire transfers": "asks for wire transfers",
      "requests payment before showing property":
        "requests payment before showing property",
      "unavailable for in-person meetings":
        "unavailable for in-person meetings",
      "uses fake property listings": "uses fake property listings",
      "requests security deposit via gift cards":
        "requests security deposit via gift cards",
      "offers lease without credit check": "offers lease without credit check",
      "refuses to provide property address":
        "refuses to provide property address",
      // New flags
      "excessive application fees": "excessive application fees",
      "requires payment in cryptocurrency":
        "requires payment in cryptocurrency",
      "claims to be out of the country": "claims to be out of the country",
      "photos don't match property": "photos don't match property",
      "price below market value": "price below market value",
      "no background check required": "no background check required",
      "refuses property tour": "refuses property tour",
      "high-pressure sales tactics": "high-pressure sales tactics",
      "no lease agreement provided": "no lease agreement provided",
      "requests bank account information": "requests bank account information",
    },
    spanish: {
      "multiple reported scams": "múltiples estafas reportadas",
      "non-existent properties": "propiedades inexistentes",
      "asks for wire transfers": "solicita transferencias bancarias",
      "requests payment before showing property":
        "solicita pago antes de mostrar la propiedad",
      "unavailable for in-person meetings":
        "no disponible para reuniones en persona",
      "uses fake property listings": "usa listados de propiedades falsos",
      "requests security deposit via gift cards":
        "solicita depósito de seguridad mediante tarjetas de regalo",
      "offers lease without credit check":
        "ofrece contrato sin verificación de crédito",
      "refuses to provide property address":
        "se niega a proporcionar la dirección de la propiedad",
      // New flags
      "excessive application fees": "tarifas de solicitud excesivas",
      "requires payment in cryptocurrency": "requiere pago en criptomoneda",
      "claims to be out of the country": "afirma estar fuera del país",
      "photos don't match property": "las fotos no coinciden con la propiedad",
      "price below market value": "precio por debajo del valor de mercado",
      "no background check required":
        "no requiere verificación de antecedentes",
      "refuses property tour": "se niega a mostrar la propiedad",
      "high-pressure sales tactics": "tácticas de venta de alta presión",
      "no lease agreement provided": "no proporciona contrato de arrendamiento",
      "requests bank account information":
        "solicita información de cuenta bancaria",
    },
    chinese: {
      "multiple reported scams": "多次被举报的骗局",
      "non-existent properties": "不存在的房产",
      "asks for wire transfers": "要求电汇转账",
      "requests payment before showing property": "在展示房产前要求付款",
      "unavailable for in-person meetings": "不提供面对面会议",
      "uses fake property listings": "使用虚假房产清单",
      "requests security deposit via gift cards": "通过礼品卡要求支付押金",
      "offers lease without credit check": "提供无信用检查的租约",
      "refuses to provide property address": "拒绝提供房产地址",
      // New flags
      "excessive application fees": "过高的申请费用",
      "requires payment in cryptocurrency": "要求使用加密货币支付",
      "claims to be out of the country": "声称人在国外",
      "photos don't match property": "照片与房产不符",
      "price below market value": "价格低于市场价值",
      "no background check required": "不要求背景调查",
      "refuses property tour": "拒绝房产参观",
      "high-pressure sales tactics": "高压销售策略",
      "no lease agreement provided": "不提供租赁协议",
      "requests bank account information": "要求银行账户信息",
    },
    hindi: {
      "multiple reported scams": "कई रिपोर्ट किए गए घोटाले",
      "non-existent properties": "अनुपस्थित संपत्तियां",
      "asks for wire transfers": "वायर ट्रांसफर के लिए पूछता है",
      "requests payment before showing property":
        "संपत्ति दिखाने से पहले भुगतान का अनुरोध करता है",
      "unavailable for in-person meetings": "व्यक्तिगत बैठकों के लिए अनुपलब्ध",
      "uses fake property listings": "नकली संपत्ति लिस्टिंग का उपयोग करता है",
      "requests security deposit via gift cards":
        "गिफ्ट कार्ड के माध्यम से सुरक्षा जमा का अनुरोध करता है",
      "offers lease without credit check":
        "क्रेडिट चेक के बिना लीज की पेशकश करता है",
      "refuses to provide property address":
        "संपत्ति का पता प्रदान करने से इनकार करता है",
      // New flags
      "excessive application fees": "अत्यधिक आवेदन शुल्क",
      "requires payment in cryptocurrency":
        "क्रिप्टोकरेंसी में भुगतान की आवश्यकता है",
      "claims to be out of the country": "देश से बाहर होने का दावा करता है",
      "photos don't match property": "तस्वीरें संपत्ति से मेल नहीं खाती हैं",
      "price below market value": "बाजार मूल्य से कम कीमत",
      "no background check required": "पृष्ठभूमि जांच की आवश्यकता नहीं है",
      "refuses property tour": "संपत्ति भ्रमण से इनकार करता है",
      "high-pressure sales tactics": "उच्च चंप वाली बिक्री रणनीतियाँ",
      "no lease agreement provided": "कोई लीज समझौता प्रदान नहीं किया गया",
      "requests bank account information":
        "बैंक खाता जानकारी का अनुरोध करता है",
    },
    korean: {
      "multiple reported scams": "여러 번 신고된 사기",
      "non-existent properties": "존재하지 않는 부동산",
      "asks for wire transfers": "계좌 이체 요청",
      "requests payment before showing property":
        "부동산 보여주기 전 결제 요청",
      "unavailable for in-person meetings": "대면 미팅 불가능",
      "uses fake property listings": "가짜 부동산 목록 사용",
      "requests security deposit via gift cards": "기프트 카드로 보증금 요청",
      "offers lease without credit check": "신용 확인 없이 임대차 계약 제공",
      "refuses to provide property address": "부동산 주소 제공 거부",
      // New flags
      "excessive application fees": "과도한 신청 수수료",
      "requires payment in cryptocurrency": "암호화폐로 지불 요구",
      "claims to be out of the country": "해외에 있다고 주장",
      "photos don't match property": "사진이 실제 부동산과 일치하지 않음",
      "price below market value": "시장 가치 이하의 가격",
      "no background check required": "신원 조회 불필요",
      "refuses property tour": "부동산 투어 거부",
      "high-pressure sales tactics": "고압적인 판매 전략",
      "no lease agreement provided": "임대 계약서 미제공",
      "requests bank account information": "은행 계좌 정보 요청",
    },
    bengali: {
      "multiple reported scams": "একাধিক রিপোর্ট করা প্রতারণা",
      "non-existent properties": "অবিদ্যমান সম্পত্তি",
      "asks for wire transfers": "ওয়্যার ট্রান্সফারের জন্য জিজ্ঞাসা করে",
      "requests payment before showing property":
        "সম্পত্তি দেখানোর আগে পেমেন্ট অনুরোধ করে",
      "unavailable for in-person meetings": "সশরীরে সাক্ষাৎ করার জন্য অনুপলব্ধ",
      "uses fake property listings": "নকল সম্পত্তি তালিকা ব্যবহার করে",
      "requests security deposit via gift cards":
        "গিফট কার্ডের মাধ্যমে সিকিউরিটি ডিপোজিট অনুরোধ করে",
      "offers lease without credit check": "ক্রেডিট চেক ছাড়া লিজ অফার করে",
      "refuses to provide property address":
        "সম্পত্তির ঠিকানা প্রদান করতে অস্বীকার করে",
      // New flags
      "excessive application fees": "অত্যধিক আবেদন ফি",
      "requires payment in cryptocurrency":
        "ক্রিপ্টোকারেন্সিতে পেমেন্ট প্রয়োজন",
      "claims to be out of the country": "দেশের বাইরে থাকার দাবি করে",
      "photos don't match property": "ছবিগুলি সম্পত্তির সাথে মেলে না",
      "price below market value": "বাজার মূল্যের চেয়ে কম দাম",
      "no background check required": "ব্যাকগ্রাউন্ড চেক প্রয়োজন নেই",
      "refuses property tour": "সম্পত্তি ভ্রমণ করতে অস্বীকার করে",
      "high-pressure sales tactics": "উচ্চ চাপের বিক্রয় কৌশল",
      "no lease agreement provided": "কোন লিজ চুক্তি প্রদান করা হয়নি",
      "requests bank account information": "ব্যাংক অ্যাকাউন্ট তথ্য অনুরোধ করে",
    },
    swahili: {
      "multiple reported scams": "ulaghai mbalimbali ulioripotiwa",
      "non-existent properties": "mali zisizokuwepo",
      "asks for wire transfers": "huomba uhamishaji wa fedha",
      "requests payment before showing property":
        "huomba malipo kabla ya kuonyesha mali",
      "unavailable for in-person meetings":
        "hapatikani kwa mikutano ya ana kwa ana",
      "uses fake property listings": "hutumia orodha za mali bandia",
      "requests security deposit via gift cards":
        "huomba amana ya usalama kupitia kadi za zawadi",
      "offers lease without credit check":
        "hutoa kukodisha bila ukaguzi wa mikopo",
      "refuses to provide property address": "hukataa kutoa anwani ya mali",
      // New flags
      "excessive application fees": "ada za maombi kubwa kupita kiasi",
      "requires payment in cryptocurrency":
        "inahitaji malipo katika sarafu ya crypto",
      "claims to be out of the country": "anadai kuwa nje ya nchi",
      "photos don't match property": "picha hazilingani na mali",
      "price below market value": "bei chini ya thamani ya soko",
      "no background check required": "hakuna ukaguzi wa historia unaohitajika",
      "refuses property tour": "anakataa kuonyesha mali",
      "high-pressure sales tactics": "mbinu za shinikizo la juu za uuzaji",
      "no lease agreement provided": "hakuna mkataba wa kukodisha uliotolewa",
      "requests bank account information":
        "anaomba maelezo ya akaunti ya benki",
    },
    arabic: {
      "multiple reported scams": "عمليات احتيال متعددة تم الإبلاغ عنها",
      "non-existent properties": "عقارات غير موجودة",
      "asks for wire transfers": "يطلب تحويلات مصرفية",
      "requests payment before showing property": "يطلب الدفع قبل عرض العقار",
      "unavailable for in-person meetings": "غير متاح للاجتماعات الشخصية",
      "uses fake property listings": "يستخدم قوائم عقارات مزيفة",
      "requests security deposit via gift cards":
        "يطلب وديعة تأمين عبر بطاقات الهدايا",
      "offers lease without credit check": "يقدم عقد إيجار بدون فحص ائتماني",
      "refuses to provide property address": "يرفض تقديم عنوان العقار",
      // New flags
      "excessive application fees": "رسوم طلب مفرطة",
      "requires payment in cryptocurrency": "يتطلب الدفع بالعملات المشفرة",
      "claims to be out of the country": "يدعي أنه خارج البلاد",
      "photos don't match property": "الصور لا تتطابق مع العقار",
      "price below market value": "السعر أقل من قيمة السوق",
      "no background check required": "لا يتطلب التحقق من الخلفية",
      "refuses property tour": "يرفض جولة العقار",
      "high-pressure sales tactics": "تكتيكات بيع عالية الضغط",
      "no lease agreement provided": "لا يوفر اتفاقية إيجار",
      "requests bank account information": "يطلب معلومات الحساب المصرفي",
    },
  };

  // Try to find a matching pattern
  for (const [pattern, translation] of Object.entries(
    scamPatterns[language] || scamPatterns.english
  )) {
    if (flag.toLowerCase().includes(pattern.toLowerCase())) {
      return translation;
    }
  }

  // If no specific translation found, return the original flag
  return flag;
}

export default function TenantCheckPanel({
  language = "english",
}: TenantCheckPanelProps) {
  const [searchParams, setSearchParams] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [results, setResults] = useState<SuspectLeaser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  // Add states for report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedLeaser, setSelectedLeaser] = useState<SuspectLeaser | null>(
    null
  );

  // Get translations for the current language
  const t =
    tenantCheckTranslations[language] || tenantCheckTranslations.english;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one field is filled
    if (
      !searchParams.name &&
      !searchParams.email &&
      !searchParams.phone &&
      !searchParams.address
    ) {
      setError(t.errorText);
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      const suspectLeasers = await api.suspectLeasers.searchSuspectLeasers({
        ...searchParams,
        language: language,
      });
      setResults(suspectLeasers);
      setShowResults(true);
    } catch (err) {
      console.error("Error searching for suspect leasers:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({ name: "", email: "", phone: "", address: "" });
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  // Handle report button click
  const handleReportClick = (leaser: SuspectLeaser) => {
    setSelectedLeaser(leaser);
    setIsReportModalOpen(true);
  };

  // Handle successful report submission
  const handleReportSuccess = (newCount: number) => {
    // Update the reported count in the local state
    if (selectedLeaser) {
      setResults(
        results.map((leaser) =>
          leaser.id === selectedLeaser.id
            ? { ...leaser, reported_count: newCount }
            : leaser
        )
      );
    }
  };

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700 mb-6">
      <Disclosure defaultOpen={false}>
        {({ open }: { open: boolean }) => (
          <div>
            <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-left text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 transition-all">
              <div className="flex items-center space-x-2">
                <div className="text-yellow-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-lg font-medium">{t.title}</span>
              </div>
              <svg
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-blue-300`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-300">
              <div className="mb-3">
                <p className="text-sm">{t.subtitle}</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={searchParams.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      {t.emailLabel}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={searchParams.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-1"
                    >
                      {t.phoneLabel}
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={searchParams.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="555-123-4567"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium mb-1"
                    >
                      {t.addressLabel}
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={searchParams.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSearching ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                    {isSearching ? t.searchingText : t.searchButton}
                  </button>

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                  >
                    {t.clearButton}
                  </button>
                </div>
              </form>

              {showResults && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">
                    {t.resultsTitle}
                  </h3>

                  {results.length === 0 ? (
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-gray-300">{t.noResultsTitle}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {t.noResultsSubtitle}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {results.map((leaser) => (
                        <div
                          key={leaser.id}
                          className="bg-red-900/20 border border-red-500 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <h4 className="text-lg font-medium text-white">
                                {leaser.name}
                              </h4>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t.reportedText} {leaser.reported_count}{" "}
                              {t.timesText}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {leaser.email && (
                              <div className="flex items-start space-x-2">
                                <span className="text-gray-400 text-sm">
                                  {t.emailText}
                                </span>
                                <span className="text-white text-sm">
                                  {leaser.email}
                                </span>
                              </div>
                            )}

                            {leaser.phone && (
                              <div className="flex items-start space-x-2">
                                <span className="text-gray-400 text-sm">
                                  {t.phoneText}
                                </span>
                                <span className="text-white text-sm">
                                  {leaser.phone}
                                </span>
                              </div>
                            )}
                          </div>

                          {leaser.addresses.length > 0 && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-sm">
                                {t.addressesText}
                              </p>
                              <ul className="list-disc list-inside text-sm text-white mt-1 pl-2">
                                {leaser.addresses.map((address, index) => (
                                  <li key={index}>{address}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {leaser.flags.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-sm">
                                {t.flagsText}
                              </p>
                              <ul className="list-disc list-inside text-sm text-white mt-1 pl-2">
                                {leaser.flags.map((flag, index) => (
                                  <li key={index} className="text-red-300">
                                    {translateFlag(flag, language)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Add Report Button */}
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleReportClick(leaser)}
                              className="flex items-center px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              {t.reportButton}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Report Modal */}
              {selectedLeaser && (
                <ReportModal
                  isOpen={isReportModalOpen}
                  onClose={() => {
                    setIsReportModalOpen(false);
                    // Small delay to allow modal close animation before resetting leaser
                    setTimeout(() => setSelectedLeaser(null), 300);
                  }}
                  leaser={selectedLeaser}
                  language={language}
                  onReportSuccess={handleReportSuccess}
                />
              )}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
