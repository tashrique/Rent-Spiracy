"use client";

import { useState } from "react";
import TrustScoreDisplay from "./ScamDetection/TrustScore/TrustScoreDisplay";
import LeaseClauseList from "./ScamDetection/LeaseClause/LeaseClauseList";
import SuggestedQuestionsList from "./ScamDetection/SuggestedQuestions/SuggestedQuestionsList";
import LawyerSection from "./ScamDetection/Lawyers/LawyerSection";
import KeyLeaseTermsSection from "./ScamDetection/KeyLeaseTerms/KeyLeaseTermsSection";
import TenantRightsSection from "./ScamDetection/TenantRights/TenantRightsSection";
import ActionItemsSection from "./ScamDetection/ActionItems/ActionItemsSection";

interface Clause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
  legal_reference?: string;
}

interface ScamDetectionResultsProps {
  language: string;
  results: {
    scam_likelihood: "Low" | "Medium" | "High";
    trustworthiness_score: number;
    trustworthiness_grade: "A" | "B" | "C" | "D" | "F";
    risk_level: "Low Risk" | "Medium Risk" | "High Risk" | "Very High Risk";
    explanation: string;
    action_items?: string[];
    simplified_clauses: Clause[];
    suggested_questions: string[];
    raw_response?: string;
    tenant_rights?: {
      relevant_statutes: string[];
      local_ordinances: string[];
      case_law: string[];
    };
    key_lease_terms?: {
      rent: {
        amount: string;
        due_date: string;
        payment_method: string;
      };
      security_deposit: {
        amount: string;
        return_conditions: string;
      };
      lease_duration: {
        start_date: string;
        end_date: string;
      };
      renewal_termination: string;
      maintenance: string;
      utilities: string;
      pets: string;
      late_payment: string;
      entry_notice: string;
      other_key_terms: string;
    };
  };
  onBack: () => void;
}

export default function ScamDetectionResults({
  language,
  results,
  onBack,
}: ScamDetectionResultsProps) {
  const [showAdvice, setShowAdvice] = useState(false);

  // Translation functions
  const getTitleText = () => {
    const texts: { [key: string]: string } = {
      english: "Scam Detection Results",
      spanish: "Resultados de Detección de Estafas",
      chinese: "欺诈检测结果",
      hindi: "धोखाधड़ी जांच परिणाम",
      korean: "사기 탐지 결과",
      bengali: "প্রতারণা সনাক্তকরণের ফলাফল",
      swahili: "Matokeo ya Ugunduzi wa Ulaghai",
      arabic: "نتائج كشف الاحتيال",
    };
    return texts[language as keyof typeof texts] || "Scam Detection Results";
  };

  const getAnalysisTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Analysis",
      spanish: "Análisis",
      chinese: "分析",
      hindi: "विश्लेषण",
      korean: "분석",
      bengali: "বিশ্লেষণ",
      swahili: "Uchambuzi",
      arabic: "تحليل",
    };
    return texts[language as keyof typeof texts] || "Analysis";
  };

  const getAdviceTitleText = () => {
    const texts: { [key: string]: string } = {
      english: "What Should I Do?",
      spanish: "¿Qué Debo Hacer?",
      chinese: "我该怎么做？",
      hindi: "मुझे क्या करना चाहिए?",
      korean: "어떻게 해야 할까요?",
      bengali: "আমার কি করা উচিত?",
      swahili: "Nifanye Nini?",
      arabic: "ماذا علي أن أفعل؟",
    };
    return texts[language as keyof typeof texts] || "What Should I Do?";
  };

  const getAdviceCloseText = () => {
    const texts: { [key: string]: string } = {
      english: "Hide Advice",
      spanish: "Ocultar Consejo",
      chinese: "隐藏建议",
      hindi: "सलाह छिपाएं",
      korean: "조언 숨기기",
      bengali: "পরামর্শ লুকান",
      swahili: "Ficha Ushauri",
      arabic: "إخفاء النصيحة",
    };
    return texts[language as keyof typeof texts] || "Hide Advice";
  };

  const getAdviceShowText = () => {
    const texts: { [key: string]: string } = {
      english: "Show Advice",
      spanish: "Mostrar Consejo",
      chinese: "显示建议",
      hindi: "सलाह दिखाएं",
      korean: "조언 보기",
      bengali: "পরামর্শ দেখান",
      swahili: "Onyesha Ushauri",
      arabic: "إظهار النصيحة",
    };
    return texts[language as keyof typeof texts] || "Show Advice";
  };

  const getBackButtonText = () => {
    const texts: { [key: string]: string } = {
      english: "Check Another Rental",
      spanish: "Verificar Otro Alquiler",
      chinese: "检查其他租赁",
      hindi: "अन्य किराये की जाँच करें",
      korean: "다른 임대 확인하기",
      bengali: "অন্য ভাড়া দেখুন",
      swahili: "Angalia Upangaji Mwingine",
      arabic: "تحقق من إيجار آخر",
    };
    return texts[language as keyof typeof texts] || "Check Another Rental";
  };

  const getAdviceText = () => {
    switch (results.risk_level.split(" ")[0]) {
      case "Low":
        return (
          {
            english:
              "This rental appears to be legitimate, but always exercise caution when providing personal information or making payments.",
            spanish:
              "Este alquiler parece ser legítimo, pero siempre tenga precaución al proporcionar información personal o realizar pagos.",
            chinese:
              "这个租赁似乎是合法的，但在提供个人信息或付款时，请务必谨慎行事。",
            hindi:
              "यह किराया वैध प्रतीत होता है, लेकिन व्यक्तिगत जानकारी प्रदान करते समय या भुगतान करते समय हमेशा सावधानी बरतें।",
            korean:
              "이 임대는 합법적인 것으로 보이지만, 개인 정보를 제공하거나 결제할 때 항상 주의하세요.",
            bengali:
              "এই ভাড়া বৈধ বলে মনে হচ্ছে, তবুও ব্যক্তিগত তথ্য প্রদান বা অর্থ প্রদান করার সময় সর্বদা সতর্কতা অবলম্বন করুন।",
            swahili:
              "Kukodisha huku kunaonekana kuwa halali, lakini daima uwe mwangalifu unapotoa maelezo ya kibinafsi au kufanya malipo.",
            arabic:
              "يبدو هذا الإيجار شرعيًا، ولكن توخَّ الحذر دائمًا عند تقديم معلومات شخصية أو إجراء مدفوعات.",
          }[language as keyof typeof getAdviceText] ||
          "This rental appears to be legitimate, but always exercise caution when providing personal information or making payments."
        );
      case "Medium":
        return (
          {
            english:
              "Proceed with caution. We recommend viewing the property in person and getting all agreements in writing before making any payments.",
            spanish:
              "Proceda con precaución. Recomendamos ver la propiedad en persona y obtener todos los acuerdos por escrito antes de realizar cualquier pago.",
            chinese:
              "谨慎行事。我们建议在付款前亲自查看房产并获得所有书面协议。",
            hindi:
              "सावधानी से आगे बढ़ें। हम किसी भी भुगतान करने से पहले संपत्ति को व्यक्तिगत रूप से देखने और सभी समझौतों को लिखित रूप में प्राप्त करने की सलाह देते हैं।",
            korean:
              "주의해서 진행하세요. 결제하기 전에 직접 부동산을 보고 모든 계약서를 서면으로 받는 것을 권장합니다.",
            bengali:
              "সাবধানতার সাথে এগিয়ে যান। আমরা কোনো অর্থ প্রদান করার আগে সম্পত্তিটি সরাসরি দেখে নেওয়ার এবং সমস্ত চুক্তি লিখিতভাবে পাওয়ার পরামর্শ দিই।",
            swahili:
              "Endelea kwa tahadhari. Tunapendekeza kuona mali hiyo binafsi na kupata makubaliano yote kwa maandishi kabla ya kufanya malipo yoyote.",
            arabic:
              "تابع بحذر. نوصي بمشاهدة العقار شخصيًا والحصول على جميع الاتفاقيات كتابةً قبل إجراء أي مدفوعات.",
          }[language as keyof typeof getAdviceText] ||
          "Proceed with caution. We recommend viewing the property in person and getting all agreements in writing before making any payments."
        );
      case "High":
      case "Very":
        return (
          {
            english:
              "This rental shows several warning signs of a potential scam. We strongly recommend avoiding any payment or personal information sharing until further verification.",
            spanish:
              "Este alquiler muestra varias señales de advertencia de una posible estafa. Recomendamos encarecidamente evitar cualquier pago o compartir información personal hasta una verificación adicional.",
            chinese:
              "这个租赁显示出潜在诈骗的几个警告信号。我们强烈建议避免任何付款或个人信息共享，直到进一步验证。",
            hindi:
              "इस किराये में संभावित धोखाधड़ी के कई चेतावनी संकेत दिखाई देते हैं। हम दृढ़ता से अनुशंसा करते हैं कि आगे की पुष्टि होने तक किसी भी भुगतान या व्यक्तिगत जानकारी साझा करने से बचें।",
            korean:
              "이 임대에는 잠재적인 사기의 여러 경고 신호가 있습니다. 추가 확인이 있을 때까지 결제나 개인 정보 공유를 피할 것을 강력히 권장합니다.",
            bengali:
              "এই ভাড়ায় সম্ভাব্য প্রতারণার বেশ কয়েকটি সতর্কতা সংকেত দেখা যাচ্ছে। আমরা দৃঢ়ভাবে সুপারিশ করি যে আরও যাচাই না হওয়া পর্যন্ত কোনো অর্থ প্রদান বা ব্যক্তিগত তথ্য শেয়ার করা এড়িয়ে চলুন।",
            swahili:
              "Upangishaji huu unaonyesha dalili kadhaa za onyo za ulaghai unaowezekana. Tunapendekeza sana kuepuka malipo yoyote au kushiriki maelezo ya kibinafsi hadi uthibitisho zaidi.",
            arabic:
              "يُظهر هذا الإيجار عدة علامات تحذيرية لاحتيال محتمل. نوصي بشدة بتجنب أي دفع أو مشاركة معلومات شخصية حتى يتم التحقق بشكل أكبر.",
          }[language as keyof typeof getAdviceText] ||
          "This rental shows several warning signs of a potential scam. We strongly recommend avoiding any payment or personal information sharing until further verification."
        );
      default:
        return "";
    }
  };

  const formatExplanation = (explanation: string): string => {
    if (!explanation) return "";

    // Replace new lines with HTML line breaks
    let formatted = explanation.replace(/\n/g, "<br>");

    // Bold important words/phrases (risk levels, warning terms)
    const highlightTerms = [
      "High Risk",
      "Medium Risk",
      "Low Risk",
      "Very High Risk",
      "scam",
      "suspicious",
      "warning",
      "caution",
      "red flag",
      "concern",
      "legitimate",
      "authentic",
      "trustworthy",
    ];

    highlightTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      formatted = formatted.replace(
        regex,
        `<strong class="text-accent">${term}</strong>`
      );
    });

    return formatted;
  };

  const getLegalDisclaimerText = () => {
    const texts: { [key: string]: string } = {
      english:
        "This assessment is based on automated analysis and may not catch all scams or lease issues. Always exercise caution and consider professional legal advice when needed.",
      spanish:
        "Esta evaluación se basa en un análisis automatizado y puede no detectar todas las estafas o problemas del contrato. Siempre actúe con precaución y considere asesoramiento legal profesional cuando sea necesario.",
      chinese:
        "此评估基于自动分析，可能无法捕获所有欺诈或租约问题。始终保持谨慎，并在需要时考虑专业法律建议。",
      hindi:
        "यह आकलन स्वचालित विश्लेषण पर आधारित है और सभी धोखाधड़ी या पट्टे के मुद्दों को पकड़ नहीं सकता है। हमेशा सावधानी बरतें और जब आवश्यक हो तब पेशेवर कानूनी सलाह पर विचार करें।",
      korean:
        "이 평가는 자동화된 분석을 기반으로 하며 모든 사기나 임대 문제를 포착하지 못할 수 있습니다. 항상 주의를 기울이고 필요할 때 전문적인 법률 조언을 고려하세요.",
      bengali:
        "এই মূল্যায়ন স্বয়ংক্রিয় বিশ্লেষণের উপর ভিত্তি করে এবং সমস্ত প্রতারণা বা লিজ সমস্যা ধরতে নাও পারে। সর্বদা সতর্কতা অবলম্বন করুন এবং প্রয়োজনে পেশাদার আইনি পরামর্শ বিবেচনা করুন।",
      swahili:
        "Tathmini hii inategemea uchambuzi wa kiotomatiki na huenda isishike ulaghai wote au masuala ya upangishaji. Daima kuwa mwangalifu na fikiria ushauri wa kisheria wa kitaalamu unapohitajika.",
      arabic:
        "يعتمد هذا التقييم على التحليل الآلي وقد لا يلتقط جميع عمليات الاحتيال أو مشكلات عقد الإيجار. توخَّ الحذر دائمًا وضع في اعتبارك المشورة القانونية المهنية عند الحاجة.",
    };
    return (
      texts[language as keyof typeof texts] ||
      "This assessment is based on automated analysis and may not catch all scams or lease issues. Always exercise caution and consider professional legal advice when needed."
    );
  };

  const getDetailed = () => {
    const translations: { [key: string]: string } = {
      english:
        "This detailed analysis evaluates the trustworthiness and potential risks of your lease document.",
      spanish:
        "Este análisis detallado evalúa la confiabilidad y los riesgos potenciales de su documento de arrendamiento.",
      chinese: "该详细分析评估了您的租约文件的可信度和潜在风险。",
      hindi:
        "यह विस्तृत विश्लेषण आपके लीज दस्तावेज की विश्वसनीयता और संभावित जोखिमों का मूल्यांकन करता है।",
      korean: "이 상세 분석은 임대 문서의 신뢰성과 잠재적 위험을 평가합니다.",
      bengali:
        "এই বিস্তারিত বিশ্লেষণ আপনার লিজ ডকুমেন্টের বিশ্বাসযোগ্যতা এবং সম্ভাব্য ঝুঁকি মূল্যায়ন করে।",
      swahili:
        "Uchambuzi huu wa kina unatathmini uaminifu na hatari zinazoweza kutokea za hati yako ya upangishaji.",
      arabic:
        "يقيم هذا التحليل المفصل جدارة الثقة والمخاطر المحتملة لمستند الإيجار الخاص بك.",
    };
    return (
      translations[language as keyof typeof translations] ||
      translations.english
    );
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {getTitleText()}
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">{getDetailed()}</p>
      </div>

      {/* Trust Score Component */}
      <TrustScoreDisplay
        language={language}
        scam_likelihood={results.scam_likelihood}
        trustworthiness_score={results.trustworthiness_score}
        trustworthiness_grade={results.trustworthiness_grade}
        risk_level={results.risk_level}
        simplified_clauses={results.simplified_clauses}
      />

      {/* Main Explanation */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            {getAnalysisTitle()}
          </h2>
          <div
            className="text-gray-300 whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: formatExplanation(results.explanation),
            }}
          />

          {/* Advice Toggle Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAdvice(!showAdvice)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
            >
              {showAdvice ? getAdviceCloseText() : getAdviceShowText()}
            </button>
          </div>

          {/* Advice Panel */}
          {showAdvice && (
            <div className="mt-6 bg-blue-900/20 p-4 rounded border border-blue-800/30 animate-fadeIn">
              <h3 className="font-semibold text-lg text-white mb-2">
                {getAdviceTitleText()}
              </h3>
              <p className="text-blue-200">{getAdviceText()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Items Section */}
      <ActionItemsSection
        language={language}
        actionItems={results.action_items}
      />

      {/* Lease Clauses Component */}
      <LeaseClauseList
        language={language}
        clauses={results.simplified_clauses}
      />

      {/* Suggested Questions Component */}
      <SuggestedQuestionsList
        language={language}
        questions={results.suggested_questions}
      />

      {/* Key Lease Terms Component (if available) */}
      {results.key_lease_terms && (
        <KeyLeaseTermsSection
          language={language}
          keyLeaseTerms={results.key_lease_terms}
        />
      )}

      {/* Tenant Rights Section (if available) */}
      <TenantRightsSection
        language={language}
        tenantRights={results.tenant_rights}
      />

      {/* Lawyer Component */}
      <LawyerSection language={language} />

      {/* Legal Disclaimer */}
      <div className="text-center mt-8 text-gray-500 text-sm bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <p>{getLegalDisclaimerText()}</p>
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
        >
          {getBackButtonText()}
        </button>
      </div>
    </div>
  );
}
