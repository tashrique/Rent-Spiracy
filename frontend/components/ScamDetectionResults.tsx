"use client";

import { useState, useMemo } from "react";

interface Clause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
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
  };
  onBack: () => void;
}

export default function ScamDetectionResults({
  language,
  results,
  onBack,
}: ScamDetectionResultsProps) {
  const [expandedClause, setExpandedClause] = useState<number | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [showExplainer, setShowExplainer] = useState(false);

  // Use trustworthiness score from API if available, otherwise calculate it
  const score = results.trustworthiness_score || getNumericScore();
  const grade = results.trustworthiness_grade || getLetterGrade();
  const riskLevel = results.risk_level || getRiskLevel();

  // Calculate a numeric score based on the likelihood and concerning clauses (fallback)
  function getNumericScore() {
    // Base score from likelihood
    let score = 0;

    switch (results.scam_likelihood) {
      case "Low":
        score = 85;
        break;
      case "Medium":
        score = 60;
        break;
      case "High":
        score = 30;
        break;
    }

    // Adjust based on concerning clauses
    const concerningClausesCount = results.simplified_clauses.filter(
      (c) => c.is_concerning
    ).length;
    const totalClauses = results.simplified_clauses.length;

    if (totalClauses > 0) {
      // Deduct up to 15 points based on ratio of concerning clauses
      score -= Math.round((concerningClausesCount / totalClauses) * 15);
    }

    // Ensure score stays in range 0-100
    return Math.max(0, Math.min(100, score));
  }

  // Get color for score display
  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 45) return "text-orange-400";
    return "text-red-400";
  };

  const getGradeColor = () => {
    switch (grade) {
      case "A":
        return "text-green-400";
      case "B":
        return "text-green-300";
      case "C":
        return "text-yellow-400";
      case "D":
        return "text-orange-400";
      case "F":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const toggleClauseExpansion = (index: number) => {
    if (expandedClause === index) {
      setExpandedClause(null);
    } else {
      setExpandedClause(index);
    }
  };

  const toggleSaveQuestion = (question: string) => {
    if (savedQuestions.includes(question)) {
      setSavedQuestions(savedQuestions.filter((q) => q !== question));
    } else {
      setSavedQuestions([...savedQuestions, question]);
    }
  };

  // Fallback letter grade calculation
  function getLetterGrade() {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  // Fallback risk level determination
  function getRiskLevel() {
    if (score >= 80) return "Low Risk";
    if (score >= 60) return "Medium Risk";
    return "High Risk";
  }

  const translations = {
    english: {
      title: "Scam Detection Results",
      scamLikelihood: "Scam Risk Assessment",
      explanation: "Analysis",
      clausesSummary: "Lease Clauses Inspection",
      suggestedQuestions: "Recommended Questions",
      backButton: "Check Another Rental",
      low: "Low Risk",
      medium: "Medium Risk",
      high: "High Risk",
      concerningClause: "Concerning",
      normalClause: "Normal",
      adviceTitle: "What Should I Do?",
      adviceClose: "Hide Advice",
      adviceShow: "Show Advice",
      viewClauseDetail: "View Details",
      hideClauseDetail: "Hide Details",
      legalDisclaimer: "Legal Disclaimer",
      scoreTitle: "Trustworthiness Score",
      saveQuestion: "Save",
      unsaveQuestion: "Unsave",
      savedQuestionsTitle: "Your Saved Questions",
      noSavedQuestions: "No saved questions yet",
      saveForLater: "Save for later",
      lowRiskAdvice:
        "This rental appears to be legitimate, but always exercise caution when providing personal information or making payments.",
      mediumRiskAdvice:
        "Proceed with caution. We recommend viewing the property in person and getting all agreements in writing before making any payments.",
      highRiskAdvice:
        "This rental shows several warning signs of a potential scam. We strongly recommend avoiding any payment or personal information sharing until further verification.",
      explainerButton: "Learn How Scores Work",
      explainerTitle: "How Rental Trustworthiness Scores Work",
      copyToClipboard: "Copy",
      copied: "Copied!",
      emailQuestions: "Email these questions",
      noSavedQuestionsYet: "Save important questions for reference",
      legalDisclaimerText:
        "This assessment is based on automated analysis and may not catch all scams or lease issues. Always exercise caution and consider professional legal advice when needed.",
    },
    spanish: {
      title: "Resultados de Detección de Estafas",
      scamLikelihood: "Evaluación de Riesgo de Estafa",
      explanation: "Análisis",
      clausesSummary: "Inspección de Cláusulas de Arrendamiento",
      suggestedQuestions: "Preguntas Recomendadas",
      backButton: "Verificar Otro Alquiler",
      low: "Riesgo Bajo",
      medium: "Riesgo Medio",
      high: "Riesgo Alto",
      concerningClause: "Preocupante",
      normalClause: "Normal",
      adviceTitle: "¿Qué Debo Hacer?",
      adviceClose: "Ocultar Consejo",
      adviceShow: "Mostrar Consejo",
      viewClauseDetail: "Ver Detalles",
      hideClauseDetail: "Ocultar Detalles",
      legalDisclaimer: "Aviso Legal",
      scoreTitle: "Puntuación de Confiabilidad",
      saveQuestion: "Guardar",
      unsaveQuestion: "Quitar",
      savedQuestionsTitle: "Tus Preguntas Guardadas",
      noSavedQuestions: "Aún no hay preguntas guardadas",
      saveForLater: "Guardar para después",
      lowRiskAdvice:
        "Este alquiler parece ser legítimo, pero siempre tenga precaución al proporcionar información personal o realizar pagos.",
      mediumRiskAdvice:
        "Proceda con precaución. Recomendamos ver la propiedad en persona y obtener todos los acuerdos por escrito antes de realizar cualquier pago.",
      highRiskAdvice:
        "Este alquiler muestra varias señales de advertencia de una posible estafa. Recomendamos encarecidamente evitar cualquier pago o compartir información personal hasta una mayor verificación.",
      explainerButton: "Aprender Cómo Funcionan las Puntuaciones",
      explainerTitle:
        "Cómo Funcionan las Puntuaciones de Confiabilidad de Alquiler",
      copyToClipboard: "Copiar",
      copied: "¡Copiado!",
      emailQuestions: "Enviar estas preguntas por correo",
      noSavedQuestionsYet: "Guarda preguntas importantes para referencia",
      legalDisclaimerText:
        "Esta evaluación se basa en un análisis automatizado y puede no capturar todas las estafas o problemas de arrendamiento. Siempre ejerza precaución y considere la consulta de un abogado profesional cuando sea necesario.",
    },
    chinese: {
      title: "诈骗检测结果",
      scamLikelihood: "诈骗风险评估",
      explanation: "分析",
      clausesSummary: "租约条款检查",
      suggestedQuestions: "推荐问题",
      backButton: "检查另一个租赁",
      low: "低风险",
      medium: "中等风险",
      high: "高风险",
      concerningClause: "值得关注",
      normalClause: "正常",
      adviceTitle: "我应该怎么做？",
      adviceClose: "隐藏建议",
      adviceShow: "显示建议",
      viewClauseDetail: "查看详情",
      hideClauseDetail: "隐藏详情",
      legalDisclaimer: "法律免责声明",
      scoreTitle: "可信度评分",
      saveQuestion: "保存",
      unsaveQuestion: "取消保存",
      savedQuestionsTitle: "您保存的问题",
      noSavedQuestions: "尚未保存问题",
      saveForLater: "稍后保存",
      lowRiskAdvice: "这个租赁似乎是合法的，但在提供个人信息或付款时务必谨慎。",
      mediumRiskAdvice:
        "请谨慎行事。我们建议您亲自查看该物业，并在付款前获得所有书面协议。",
      highRiskAdvice:
        "这个租赁显示了潜在诈骗的几个警告信号。我们强烈建议在进一步验证之前，避免任何付款或个人信息共享。",
      explainerButton: "了解评分如何工作",
      explainerTitle: "租赁可信度评分如何工作",
      copyToClipboard: "复制",
      copied: "已复制！",
      emailQuestions: "通过电子邮件发送这些问题",
      noSavedQuestionsYet: "保存重要问题以供参考",
      legalDisclaimerText:
        "此评估基于自动分析，可能无法捕获所有诈骗或租赁问题。始终谨慎行事并考虑在需要时寻求专业法律建议。",
    },
    hindi: {
      title: "धोखाधड़ी का पता लगाने के परिणाम",
      scamLikelihood: "धोखाधड़ी जोखिम मूल्यांकन",
      explanation: "विश्लेषण",
      clausesSummary: "लीज क्लॉज निरीक्षण",
      suggestedQuestions: "अनुशंसित प्रश्न",
      backButton: "एक और किराये की जांच करें",
      low: "कम जोखिम",
      medium: "मध्यम जोखिम",
      high: "उच्च जोखिम",
      concerningClause: "चिंताजनक",
      normalClause: "सामान्य",
      adviceTitle: "मुझे क्या करना चाहिए?",
      adviceClose: "सलाह छिपाएं",
      adviceShow: "सलाह दिखाएं",
      viewClauseDetail: "विवरण देखें",
      hideClauseDetail: "विवरण छिपाएं",
      legalDisclaimer: "कानूनी अस्वीकरण",
      scoreTitle: "विश्वसनीयता स्कोर",
      saveQuestion: "सहेजें",
      unsaveQuestion: "हटाएं",
      savedQuestionsTitle: "आपके सहेजे गए प्रश्न",
      noSavedQuestions: "अभी तक कोई सहेजा गया प्रश्न नहीं",
      saveForLater: "बाद के लिए सहेजें",
      lowRiskAdvice:
        "यह किराया वैध प्रतीत होता है, लेकिन व्यक्तिगत जानकारी प्रदान करते समय या भुगतान करते समय हमेशा सावधानी बरतें।",
      mediumRiskAdvice:
        "सावधानी से आगे बढ़ें। हम किसी भी भुगतान करने से पहले व्यक्तिगत रूप से संपत्ति देखने और सब समझौतों को लिखित रूप में प्राप्त करने की सलाह देते हैं।",
      highRiskAdvice:
        "इस किराये में संभावित धोखाधड़ी के कई चेतावनी संकेत दिखाए गए हैं। हम दृढ़ता से आगे की पुष्टि होने तक किसी भी भुगतान या व्यक्तिगत जानकारी साझा करने से बचने की सलाह देते हैं।",
      explainerButton: "जानें कैसे स्कोर काम करते हैं",
      explainerTitle: "किराया विश्वसनीयता स्कोर कैसे काम करते हैं",
      copyToClipboard: "कॉपी करें",
      copied: "कॉपी हो गया!",
      emailQuestions: "इन प्रश्नों को ईमेल करें",
      noSavedQuestionsYet: "संदर्भ के लिए महत्वपूर्ण प्रश्न सहेजें",
      legalDisclaimerText:
        "यह टूल एक कानूनी दस्तावेज़ नहीं है और कानूनी सलाह नहीं देता है। एस्ट शुधुं जानकारीप्रदान के लिए है।",
    },
    korean: {
      title: "사기 탐지 결과",
      scamLikelihood: "사기 위험 평가",
      explanation: "분석",
      clausesSummary: "임대 조건 검사",
      suggestedQuestions: "추천 질문",
      backButton: "다른 임대 확인",
      low: "낮은 위험",
      medium: "중간 위험",
      high: "높은 위험",
      concerningClause: "걱정스러운",
      normalClause: "정상",
      adviceTitle: "어떻게 해야 할까요?",
      adviceClose: "조언 숨기기",
      adviceShow: "조언 보기",
      viewClauseDetail: "상세 보기",
      hideClauseDetail: "상세 숨기기",
      legalDisclaimer: "법적 고지",
      scoreTitle: "신뢰도 점수",
      saveQuestion: "저장",
      unsaveQuestion: "저장 취소",
      savedQuestionsTitle: "저장된 질문",
      noSavedQuestions: "아직 저장된 질문이 없습니다",
      saveForLater: "나중을 위해 저장",
      lowRiskAdvice:
        "이 임대는 합법적으로 보이지만, 개인 정보를 제공하거나 지불할 때는 항상 주의하세요.",
      mediumRiskAdvice:
        "주의해서 진행하세요. 지불하기 전에 직접 부동산을 방문하고 모든 계약을 서면으로 받는 것을 권장합니다.",
      highRiskAdvice:
        "이 임대는 잠재적 사기의 여러 경고 신호를 보여줍니다. 추가 확인이 이루어질 때까지 지불이나 개인 정보 공유를 피할 것을 강력히 권장합니다.",
      explainerButton: "점수 작동 방식 알아보기",
      explainerTitle: "임대 신뢰도 점수 작동 방식",
      copyToClipboard: "복사",
      copied: "복사됨!",
      emailQuestions: "이메일로 질문 보내기",
      noSavedQuestionsYet: "참고용으로 중요한 질문 저장",
      legalDisclaimerText:
        "이 도구는 법률 문서가 아니며 법률 조언을 제공하지 않습니다. 정보 목적으로만 사용됩니다.",
    },
    bengali: {
      title: "প্রতারণা সনাক্তকরণ ফলাফল",
      scamLikelihood: "প্রতারণা ঝুঁকি মূল্যায়ন",
      explanation: "বিশ্লেষণ",
      clausesSummary: "লিজ ধারা পরিদর্শন",
      suggestedQuestions: "প্রস্তাবিত প্রশ্ন",
      backButton: "অন্য ভাড়া যাচাই করুন",
      low: "কম ঝুঁকি",
      medium: "মাঝারি ঝুঁকি",
      high: "উচ্চ ঝুঁকি",
      concerningClause: "উদ্বেগজনক",
      normalClause: "স্বাভাবিক",
      adviceTitle: "আমার কি করা উচিত?",
      adviceClose: "পরামর্শ লুকান",
      adviceShow: "পরামর্শ দেখান",
      viewClauseDetail: "বিস্তারিত দেখুন",
      hideClauseDetail: "বিস্তারিত লুকান",
      legalDisclaimer: "আইনি দায়বন্ধনা",
      scoreTitle: "বিশ্বাসযোগ্যতা স্কোর",
      saveQuestion: "সংরক্ষণ করুন",
      unsaveQuestion: "সংরক্ষণ বাতিল করুন",
      savedQuestionsTitle: "আপনার সংরক্ষিত প্রশ্ন",
      noSavedQuestions: "এখনও কোন সংরক্ষিত প্রশ্ন নেই",
      saveForLater: "পরে সংরক্ষণ করুন",
      lowRiskAdvice:
        "এই ভাড়াটি বৈধ বলে মনে হচ্ছে, তবুও ব্যক্তিগত তথ্য প্রদান বা অর্থ প্রদান করার সময় সর্বদা সতর্কতা অবলম্বন করুন।",
      mediumRiskAdvice:
        "সতর্কতার সাথে এগিয়ে যান। আমরা অর্থ প্রদানের আগে সম্পত্তিটি সরাসরি দেখতে এবং সব চুক্তি লিখিতভাবে নিতে সুপারিশ করি।",
      highRiskAdvice:
        "এই ভাড়াটি সম্ভাব্য প্রতারণার বেশ কয়েকটি সতর্কতা সংকেত দেখায়। আমরা আরও যাচাই না হওয়া পর্যন্ত যেকোনো অর্থ প্রদান বা ব্যক্তিগত তথ্য শেয়ার করা এড়িয়ে চলার জোরালোভাবে পরামর্শ দিচ্ছি।",
      explainerButton: "স্কোর কীভাবে কাজ করে জানুন",
      explainerTitle: "ভাড়া বিশ্বাসযোগ্যতা স্কোর কীভাবে কাজ করে",
      copyToClipboard: "কপি করুন",
      copied: "কপি করা হয়েছে!",
      emailQuestions: "এই প্রশ্নগুলি ইমেল করুন",
      noSavedQuestionsYet: "রেফারেন্সের জন্য গুরুত্বপূর্ণ প্রশ্ন সংরক্ষণ করুন",
      legalDisclaimerText:
        "এই টুল একটি কানুনী দস্তাবেজ নয় এবং কানুনী সালাউট নয়। এটি শুধুমাত্র তথ্যপ্রদানের জন্য হয়।",
    },
  };

  const t =
    translations[language as keyof typeof translations] || translations.english;

  // Get color for likelihood display
  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "Low":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "High":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const [copied, setCopied] = useState(false);

  const copyQuestionsToClipboard = () => {
    const textToCopy =
      savedQuestions.length > 0
        ? savedQuestions.join("\n\n")
        : results.suggested_questions.join("\n\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Helper function to clean and format explanation text
  const formatExplanation = (explanation: string): string => {
    // Split to remove metadata section
    const mainContent = explanation.split("\n\nRequest Information")[0];

    // Handle if the explanation contains JSON
    if (
      mainContent.includes("```json") ||
      (mainContent.startsWith("{") && mainContent.includes('"explanation":'))
    ) {
      // Try to extract JSON from code block
      const jsonBlockMatch = mainContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        try {
          const data = JSON.parse(jsonBlockMatch[1]);
          if (data.explanation) {
            return data.explanation;
          }
        } catch {
          // Failed to parse JSON, continue to other methods
        }
      }

      // Try to parse the whole content as JSON
      if (
        mainContent.trim().startsWith("{") &&
        mainContent.trim().endsWith("}")
      ) {
        try {
          const data = JSON.parse(mainContent);
          if (data.explanation) {
            return data.explanation;
          }
        } catch {
          // Failed to parse JSON, continue to other methods
        }
      }

      // Try to extract the explanation field using regex
      const explanationMatch = mainContent.match(
        /"explanation"\s*:\s*"([^"]+)"/
      );
      if (explanationMatch && explanationMatch[1]) {
        return explanationMatch[1];
      }

      // Last resort: clean up the JSON manually
      return mainContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/{|}|"|\[|\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return mainContent;
  };

  // Function to parse raw response JSON if available
  const parseRawResponse = () => {
    if (!results.raw_response) return null;

    try {
      // Try to find and extract JSON from code blocks
      const jsonMatch = results.raw_response.match(
        /```(?:json)?\s*({\s*".*?})\s*```/
      );
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON directly in the response
      const jsonPattern = /({\s*".*?})/;
      const directMatch = results.raw_response.match(jsonPattern);
      if (directMatch) {
        return JSON.parse(directMatch[1]);
      }
    } catch (e) {
      console.error("Failed to parse raw response JSON:", e);
    }

    return null;
  };

  // Get raw data if available
  const rawData = parseRawResponse();

  // Use raw data for clauses if available and not overridden by simplified_clauses
  const displayClauses = useMemo(() => {
    if (results.simplified_clauses && results.simplified_clauses.length > 0) {
      return results.simplified_clauses;
    }

    if (rawData && (rawData.concerning_clauses || rawData.clauses)) {
      const rawClauses = rawData.concerning_clauses || rawData.clauses || [];
      // Use an interface instead of any
      interface RawClause {
        original_text?: string;
        text?: string;
        simplified_text?: string;
        is_concerning?: boolean;
        reason?: string;
      }
      return rawClauses.map((clause: RawClause) => ({
        text: clause.original_text || clause.text || "",
        simplified_text: clause.simplified_text || "",
        is_concerning:
          clause.is_concerning !== undefined ? clause.is_concerning : true,
        reason: clause.reason || "",
      }));
    }

    return results.simplified_clauses;
  }, [results.simplified_clauses, rawData]);

  // Use raw data for questions if available
  const displayQuestions = useMemo(() => {
    if (
      rawData &&
      rawData.suggested_questions &&
      rawData.suggested_questions.length > 0
    ) {
      return rawData.suggested_questions;
    }

    return results.suggested_questions;
  }, [results.suggested_questions, rawData]);

  // Use raw data for action items if available
  const displayActionItems = useMemo(() => {
    if (rawData && rawData.action_items && rawData.action_items.length > 0) {
      return rawData.action_items;
    }

    return results.action_items || [];
  }, [results.action_items, rawData]);

  // Get explanation from raw data if available
  const displayExplanation = useMemo(() => {
    if (rawData && rawData.explanation && rawData.explanation.length > 20) {
      return rawData.explanation;
    }

    return formatExplanation(results.explanation);
  }, [results.explanation, rawData]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-block animate-float mb-2">
          {results.scam_likelihood === "High" ? (
            <span className="text-4xl">⚠️</span>
          ) : results.scam_likelihood === "Medium" ? (
            <span className="text-4xl">🧐</span>
          ) : (
            <span className="text-4xl">✅</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          This detailed analysis evaluates the trustworthiness and potential
          risks of your lease document.
        </p>
      </div>

      <div className="space-y-8">
        {/* Score Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300">
          <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-blue-500/20 blur-xl animate-pulse-slow"></div>

          <h2 className="text-xl font-semibold mb-5 text-white flex items-center gap-2">
            {t.scoreTitle}
            <span className="animate-float inline-block">🏆</span>
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-full transition-colors"
            >
              {t.explainerButton}
            </button>
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center mb-4 md:mb-0">
              <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                {score}
              </div>
              <div className="text-sm text-gray-400">/ 100</div>
            </div>

            <div className="h-20 w-px bg-gray-700 hidden md:block"></div>

            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-400 uppercase mb-1">Grade</div>
              <div className={`text-5xl font-bold ${getGradeColor()}`}>
                {grade}
              </div>
            </div>

            <div className="h-20 w-px bg-gray-700 hidden md:block"></div>

            <div className="mt-4 md:mt-0">
              <div className="text-sm text-gray-400 uppercase mb-2">
                Risk Level
              </div>
              <div className="flex items-center justify-center my-3">
                <div
                  className={`text-xl font-bold ${getLikelihoodColor(
                    results.scam_likelihood
                  )}`}
                >
                  {riskLevel}
                </div>
              </div>
            </div>
          </div>

          {showExplainer && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700 animate-bounceIn">
              <h3 className="font-semibold text-white mb-2">
                {t.explainerTitle}
              </h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  Our algorithm analyzes multiple factors to generate a
                  trustworthiness score:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Lease analysis - identifying problematic clauses</li>
                  <li>Price comparison with market rates</li>
                  <li>
                    Evaluation of payment terms and security deposit
                    requirements
                  </li>
                  <li>Assessment of landlord communication patterns</li>
                  <li>Property information verification</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2 italic">
                  Scores 80-100 are considered trustworthy, 50-79 require
                  caution, and below 50 show significant warning signs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300">
          <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-blue-500/20 blur-xl animate-pulse-slow"></div>

          <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
            {t.scamLikelihood}
            <span className="animate-float inline-block">🔍</span>
          </h2>

          <div className="mt-4">
            <h3 className="font-medium mb-2 text-gray-200">{t.explanation}</h3>
            <pre className="text-gray-300 bg-gray-900/30 p-4 rounded-lg border border-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {displayExplanation}
            </pre>

            <div className="mt-6">
              <button
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                onClick={() => setShowAdvice(!showAdvice)}
              >
                <span>{showAdvice ? t.adviceClose : t.adviceShow}</span>
                <span>{showAdvice ? "▲" : "▼"}</span>
              </button>

              {showAdvice && (
                <div className="p-5 bg-gray-700 animate-fadeIn border-t border-gray-600 mt-2 rounded-lg">
                  <h3 className="font-semibold text-white mb-3 text-lg flex items-center gap-2">
                    {t.adviceTitle}
                    <span className="animate-float">💡</span>
                  </h3>
                  {/* Use displayActionItems which may use raw JSON data */}
                  <ul className="space-y-2 text-gray-300 leading-relaxed list-disc pl-5">
                    {displayActionItems.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lease Clauses Analysis */}
        {displayClauses.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300">
            <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-purple-500/20 blur-xl animate-float"></div>

            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              {t.clausesSummary}
              <span className="animate-float inline-block">📋</span>
              <span className="ml-auto text-sm text-gray-400">
                {displayClauses.filter((c: Clause) => c.is_concerning).length}{" "}
                concerning / {displayClauses.length} total
              </span>
            </h2>
            <div className="space-y-4">
              {displayClauses.map((clause: Clause, index: number) => (
                <div
                  key={index}
                  className="border-b border-gray-700 pb-4 last:border-0 last:pb-0 hover:bg-gray-800/50 p-3 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium transform transition-all hover:scale-105 ${
                        clause.is_concerning
                          ? "bg-red-800 text-red-100"
                          : "bg-green-800 text-green-100"
                      }`}
                    >
                      {clause.is_concerning ? (
                        <span className="flex items-center gap-1">
                          {t.concerningClause}{" "}
                          <span className="animate-pulse-slow inline-block">
                            ⚠️
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {t.normalClause} <span>👍</span>
                        </span>
                      )}
                    </span>

                    <button
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => toggleClauseExpansion(index)}
                    >
                      {expandedClause === index
                        ? t.hideClauseDetail
                        : t.viewClauseDetail}
                    </button>
                  </div>

                  {expandedClause === index ? (
                    <div className="animate-bounceIn">
                      <p className="text-sm text-gray-400 mb-2 italic">
                        {clause.text}
                      </p>
                      <p className="text-gray-200 mb-2">
                        {clause.simplified_text}
                      </p>
                      {clause.is_concerning && clause.reason && (
                        <p className="mt-2 text-sm text-red-400 bg-red-900/20 p-2 rounded">
                          {clause.reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-200">{clause.simplified_text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {displayQuestions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300">
            <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-pink-500/20 blur-xl animate-pulse-slow"></div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {t.suggestedQuestions}
                <span className="animate-float inline-block">❓</span>
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={copyQuestionsToClipboard}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  <span>{copied ? t.copied : t.copyToClipboard}</span>
                  <span>{copied ? "✓" : "📋"}</span>
                </button>

                {savedQuestions.length > 0 && (
                  <button
                    onClick={() =>
                      window.open(
                        `mailto:?subject=Questions about rental&body=${encodeURIComponent(
                          savedQuestions.join("\n\n")
                        )}`
                      )
                    }
                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    {t.emailQuestions}
                  </button>
                )}
              </div>
            </div>

            <ul className="list-none space-y-3 mb-6">
              {displayQuestions.map((question: string, index: number) => (
                <li
                  key={index}
                  className="text-gray-300 flex items-start gap-2 p-2 hover:bg-gray-700/30 rounded transition-all transform hover:translate-x-1 group/item"
                >
                  <span className="text-blue-400 mt-1">→</span>
                  <span className="flex-1">{question}</span>
                  <button
                    onClick={() => toggleSaveQuestion(question)}
                    className={`opacity-0 group-hover/item:opacity-100 transition-opacity px-2 py-0.5 rounded text-xs ${
                      savedQuestions.includes(question)
                        ? "bg-gray-700 text-gray-300"
                        : "bg-blue-700 text-white"
                    }`}
                  >
                    {savedQuestions.includes(question)
                      ? t.unsaveQuestion
                      : t.saveQuestion}
                  </button>
                </li>
              ))}
            </ul>

            {/* Saved Questions Section */}
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <span>{t.savedQuestionsTitle}</span>
                <span className="text-xs text-gray-500">
                  ({savedQuestions.length})
                </span>
              </h3>

              {savedQuestions.length > 0 ? (
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <ul className="space-y-2">
                    {savedQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-start group"
                      >
                        <span className="text-gray-300 text-sm">
                          {i + 1}. {q}
                        </span>
                        <button
                          onClick={() => toggleSaveQuestion(q)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  {t.noSavedQuestionsYet}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="text-xs text-gray-500 italic bg-gray-800/50 p-3 rounded border border-gray-700 text-center">
          {t.legalDisclaimer}: {t.legalDisclaimerText}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 group flex items-center gap-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            {t.backButton}
          </button>
        </div>
      </div>
    </div>
  );
}
