"use client";

import { useState } from "react";

interface Clause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
  legal_reference?: string;
}

interface LeaseClauseListProps {
  language: string;
  clauses: Clause[];
}

export default function LeaseClauseList({
  language,
  clauses,
}: LeaseClauseListProps) {
  const [expandedClause, setExpandedClause] = useState<number | null>(null);

  const toggleClauseExpansion = (index: number) => {
    if (expandedClause === index) {
      setExpandedClause(null);
    } else {
      setExpandedClause(index);
    }
  };

  const highlightWarningWords = (text: string): string => {
    // Common warning words to highlight in lease clauses
    const warningWords = [
      "forfeit",
      "waive",
      "waiver",
      "immediate eviction",
      "terminate without notice",
      "no refund",
      "non-refundable",
      "no liability",
      "not responsible",
      "sole discretion",
      "without cause",
      "without reason",
      "no exceptions",
      "unannounced inspection",
      "unannounced visit",
      "at any time",
      "for any reason",
      "without prior notice",
      "without refund",
      "mandatory fee",
      "automatic deduction",
      "excessive fee",
      "prohibit",
      "unreasonable",
      "penalties",
    ];

    let highlighted = text;

    // Escape regex special characters and create regex pattern
    const escapedWords = warningWords.map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const pattern = new RegExp(`(${escapedWords.join("|")})`, "gi");

    // Add highlighting spans
    highlighted = highlighted.replace(
      pattern,
      '<span class="text-yellow-400 font-semibold">$1</span>'
    );

    return highlighted;
  };

  const unescapeText = (text: string): string => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Translation functions
  const getClausesTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Lease Clauses Inspection",
      spanish: "Inspección de Cláusulas del Contrato",
      chinese: "租约条款检查",
      hindi: "लीज़ क्लॉज़ निरीक्षण",
      korean: "임대 조항 검사",
      bengali: "লিজ ক্লজ পরিদর্শন",
      swahili: "Ukaguzi wa Vifungu vya Kukodisha",
      arabic: "فحص بنود عقد الإيجار",
    };
    return texts[language as keyof typeof texts] || "Lease Clauses Inspection";
  };

  const getConcerningLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Concerning",
      spanish: "Preocupante",
      chinese: "令人担忧",
      hindi: "चिंताजनक",
      korean: "우려되는",
      bengali: "উদ্বেগজনক",
      swahili: "Inayotatiza",
      arabic: "مثير للقلق",
    };
    return texts[language as keyof typeof texts] || "Concerning";
  };

  const getNormalLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Normal",
      spanish: "Normal",
      chinese: "正常",
      hindi: "सामान्य",
      korean: "정상",
      bengali: "স্বাভাবিক",
      swahili: "Kawaida",
      arabic: "عادي",
    };
    return texts[language as keyof typeof texts] || "Normal";
  };

  const getViewDetailsText = () => {
    const texts: { [key: string]: string } = {
      english: "View Details",
      spanish: "Ver Detalles",
      chinese: "查看详情",
      hindi: "विवरण देखें",
      korean: "세부 정보 보기",
      bengali: "বিস্তারিত দেখুন",
      swahili: "Angalia Maelezo",
      arabic: "عرض التفاصيل",
    };
    return texts[language as keyof typeof texts] || "View Details";
  };

  const getHideDetailsText = () => {
    const texts: { [key: string]: string } = {
      english: "Hide Details",
      spanish: "Ocultar Detalles",
      chinese: "隐藏详情",
      hindi: "विवरण छिपाएं",
      korean: "세부 정보 숨기기",
      bengali: "বিস্তারিত লুকান",
      swahili: "Ficha Maelezo",
      arabic: "إخفاء التفاصيل",
    };
    return texts[language as keyof typeof texts] || "Hide Details";
  };

  const getReasonLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Why this is concerning:",
      spanish: "Por qué es preocupante:",
      chinese: "为什么这令人担忧：",
      hindi: "यह चिंताजनक क्यों है:",
      korean: "우려되는 이유:",
      bengali: "এটি কেন উদ্বেগজনক:",
      swahili: "Kwa nini hii inatatiza:",
      arabic: "لماذا هذا مثير للقلق:",
    };
    return texts[language as keyof typeof texts] || "Why this is concerning:";
  };

  const getLegalReferenceLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Legal Reference:",
      spanish: "Referencia Legal:",
      chinese: "法律参考：",
      hindi: "कानूनी संदर्भ:",
      korean: "법적 참조:",
      bengali: "আইনি রেফারেন্স:",
      swahili: "Marejeleo ya Kisheria:",
      arabic: "المرجع القانوني:",
    };
    return texts[language as keyof typeof texts] || "Legal Reference:";
  };

  //   const getHighConcernLabel = () => {
  //     const texts: { [key: string]: string } = {
  //       english: "High Concern",
  //       spanish: "Alta Preocupación",
  //       chinese: "高度关注",
  //       hindi: "उच्च चिंता",
  //       korean: "높은 우려",
  //       bengali: "উচ্চ উদ্বেগ",
  //       swahili: "Wasiwasi Mkubwa",
  //       arabic: "قلق كبير",
  //     };
  //     return texts[language as keyof typeof texts] || "High Concern";
  //   };

  //   const getModerateConcernLabel = () => {
  //     const texts: { [key: string]: string } = {
  //       english: "Moderate Concern",
  //       spanish: "Preocupación Moderada",
  //       chinese: "中度关注",
  //       hindi: "मध्यम चिंता",
  //       korean: "중간 우려",
  //       bengali: "মাঝারি উদ্বেগ",
  //       swahili: "Wasiwasi wa Wastani",
  //       arabic: "قلق معتدل",
  //     };
  //     return texts[language as keyof typeof texts] || "Moderate Concern";
  //   };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">
          {getClausesTitle()}
        </h2>

        <div className="space-y-4">
          {clauses.map((clause, index) => (
            <div
              key={index}
              className={`bg-gray-800 rounded-lg p-4 border ${
                clause.is_concerning ? "border-red-500/50" : "border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    clause.is_concerning
                      ? "bg-red-900/40 text-red-300"
                      : "bg-green-900/40 text-green-300"
                  }`}
                >
                  {clause.is_concerning
                    ? getConcerningLabel()
                    : getNormalLabel()}
                </div>
                <button
                  onClick={() => toggleClauseExpansion(index)}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  {expandedClause === index
                    ? getHideDetailsText()
                    : getViewDetailsText()}
                </button>
              </div>

              <div className="text-white mb-3">{clause.simplified_text}</div>

              {expandedClause === index && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                  {/* Original Text */}
                  <div>
                    <div className="text-gray-400 text-sm mb-1">
                      Original Clause:
                    </div>
                    <div
                      className="text-gray-300 text-sm bg-gray-850 p-3 rounded border border-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: highlightWarningWords(
                          unescapeText(clause.text)
                        ),
                      }}
                    />
                  </div>

                  {/* Reason for concern */}
                  {clause.is_concerning && clause.reason && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">
                        {getReasonLabel()}
                      </div>
                      <div className="text-yellow-300 text-sm bg-yellow-900/20 p-3 rounded border border-yellow-800/50">
                        {clause.reason}
                      </div>
                    </div>
                  )}

                  {/* Legal Reference */}
                  {clause.is_concerning && clause.legal_reference && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">
                        {getLegalReferenceLabel()}
                      </div>
                      <div className="text-blue-300 text-sm bg-blue-900/20 p-3 rounded border border-blue-800/50">
                        {clause.legal_reference}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
