"use client";

import { useState, useMemo } from "react";

interface Clause {
  text: string;
  simplified_text: string;
  is_concerning: boolean;
  reason?: string;
  california_law?: string;
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
    california_tenant_rights?: {
      relevant_statutes: string[];
      local_ordinances: string[];
      case_law: string[];
    };
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
    // Base score from likelihood - MORE GENEROUS STARTING POINTS
    let score = 0;

    switch (results.scam_likelihood) {
      case "Low":
        score = 92; // Increased from 85
        break;
      case "Medium":
        score = 78; // Increased from 60
        break;
      case "High":
        score = 50; // Increased from 30
        break;
    }

    // Adjust based on concerning clauses - LESS SEVERE PENALTIES
    const concerningClausesCount = results.simplified_clauses.filter(
      (c) => c.is_concerning
    ).length;
    const totalClauses = results.simplified_clauses.length;

    if (totalClauses > 0) {
      // Deduct up to 8 points (reduced from 15) based on ratio of concerning clauses
      // Also added weighting to make penalties less severe
      const impactRatio = Math.min(0.8, concerningClausesCount / totalClauses);
      score -= Math.round(impactRatio * 8);
    }

    // Ensure score stays in range 0-100
    return Math.max(0, Math.min(100, score));
  }

  // Get color for score display - MORE GENEROUS COLOR THRESHOLDS
  const getScoreColor = () => {
    if (score >= 75) return "text-green-400";
    if (score >= 55) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
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

  // Fallback letter grade calculation - MORE GENEROUS GRADING
  function getLetterGrade() {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
  }

  // Fallback risk level determination - MORE GENEROUS RISK LEVELS
  function getRiskLevel() {
    if (score >= 70) return "Low Risk";
    if (score >= 45) return "Medium Risk";
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
      highConcernClause: "High Concern",
      moderateConcernClause: "Moderate Concern",
      detailedAnalysisDesc:
        "This detailed analysis evaluates the trustworthiness and potential risks of your lease document.",
      grade: "Grade",
      riskLevel: "Risk Level",
      algorithmExplainerIntro:
        "Our algorithm analyzes multiple factors to generate a trustworthiness score:",
      leaseAnalysisFactor: "Lease analysis - identifying problematic clauses",
      priceComparisonFactor: "Price comparison with market rates",
      paymentTermsFactor:
        "Evaluation of payment terms and security deposit requirements",
      landlordCommunicationFactor:
        "Assessment of landlord communication patterns",
      propertyVerificationFactor: "Property information verification",
      scoreRangeExplanation:
        "Scores 80-100 are considered trustworthy, 50-79 require caution, and below 50 show significant warning signs.",
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
      highConcernClause: "Alto Riesgo",
      moderateConcernClause: "Riesgo Moderado",
      detailedAnalysisDesc:
        "Este análisis detallado evalúa la confiabilidad y los posibles riesgos de su documento de arrendamiento.",
      grade: "Calificación",
      riskLevel: "Nivel de Riesgo",
      algorithmExplainerIntro:
        "Nuestro algoritmo analiza varios factores para generar una puntuación de confiabilidad:",
      leaseAnalysisFactor:
        "Análisis de arrendamiento - identificar cláusulas problemáticas",
      priceComparisonFactor: "Comparación de precios con tasas de mercado",
      paymentTermsFactor:
        "Evaluación de términos de pago y requisitos de depósito de seguridad",
      landlordCommunicationFactor:
        "Evaluación de patrones de comunicación del propietario",
      propertyVerificationFactor:
        "Verificación de información sobre la propiedad",
      scoreRangeExplanation:
        "Las puntuaciones de 80 a 100 se consideran confiables, de 50 a 79 requieren precaución y menos de 50 muestran signos de advertencia significativos.",
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
      highConcernClause: "高风险",
      moderateConcernClause: "中等风险",
      detailedAnalysisDesc: "此详细分析评估了您的租赁文件的可靠性和潜在风险。",
      grade: "等级",
      riskLevel: "风险水平",
      algorithmExplainerIntro: "我们的算法分析多个因素以生成可信度评分：",
      leaseAnalysisFactor: "租赁分析 - 识别问题条款",
      priceComparisonFactor: "与市场利率的价格比较",
      paymentTermsFactor: "评估付款条款和安全存款要求",
      landlordCommunicationFactor: "评估房东沟通模式",
      propertyVerificationFactor: "财产信息验证",
      scoreRangeExplanation:
        "分数80-100被认为是可信的，50-79需要谨慎，低于50显示重大警告信号。",
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
        "सावधानी से आगे बढ़ें। हम किसी भी भुगतान करने के लिए पहले व्यक्तिगत रूप से संपत्ति देखने और सब समझौतों को लिखित रूप में प्राप्त करने की सलाह देते हैं।",
      highRiskAdvice:
        "इस किराये में संभावित धोखाधड़ी के कई चेतावनी संकेत दिखाए गए हैं। हम दृढ़ता से आगे की पुष्टि होने तक किसी भी भुगतान या व्यक्तिगत जानकारी साझा करने से बचने की सलाह देते हैं।",
      explainerButton: "जानें कैसे स्कोर काम करते हैं",
      explainerTitle: "किराया विश्वसनीयता स्कोर कैसे काम करते हैं",
      copyToClipboard: "कॉपी करें",
      copied: "कॉपी हो गया!",
      emailQuestions: "इन प्रश्नों को ईमेल करें",
      noSavedQuestionsYet: "संदर्भ के लिए महत्वपूर्ण प्रश्न सहेजें",
      legalDisclaimerText:
        "यह टूल एक कानूनी दस्तावेज़ नहीं है और कानूनी सलाउट नहीं देता है। एस्ट शुधुं जानकारीप्रदान के लिए है।",
      highConcernClause: "उच्च जोखिम",
      moderateConcernClause: "मध्यम जोखिम",
      detailedAnalysisDesc:
        "इस विस्तृत विश्लेषण द्वारा आपके किराये के फाइलों की विश्वसनीयता और संभव जोखिमों का आकलन किया गया है।",
      grade: "ग्रेड",
      riskLevel: "जोखिम का स्तर",
      algorithmExplainerIntro:
        "हमारा एल्गोरिथम कई कारकों को विश्वसनीयता स्कोर उत्पन्न करने के लिए विश्लेषण करता है:",
      leaseAnalysisFactor: "किराये का विश्लेषण - समस्यापूर्ण क्लॉज पहचानना",
      priceComparisonFactor: "बाजार दरों के साथ कीमत तुलना",
      paymentTermsFactor:
        "भुगतान के शर्तों का आकलन और सुरक्षा जमा की आवश्यकताओं का आकलन",
      landlordCommunicationFactor: "राउंट कॉम्युनिकेशन पैटर्न का आकलन",
      propertyVerificationFactor: "संपत्ति की जानकारी सत्यापन",
      scoreRangeExplanation:
        "अंक 80-100 को विश्वसनीय माना जाता है, 50-79 प্रयोजन प्रयोजन एवं 50 नीचे गुरुत्वपूर्ण चिह्न देखाते हैं।",
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
      highConcernClause: "높은 위험",
      moderateConcernClause: "중간 위험",
      detailedAnalysisDesc:
        "이 상세 분석은 주택 계약서의 신뢰도와 잠재적인 위험을 평가합니다.",
      grade: "등급",
      riskLevel: "위험 수준",
      algorithmExplainerIntro:
        "우리의 알고리즘은 신뢰도 점수를 생성하기 위해 여러 요소를 분석합니다:",
      leaseAnalysisFactor: "임대 분석 - 문제 조건 식별",
      priceComparisonFactor: "시장 금리와의 가격 비교",
      paymentTermsFactor: "지불 조건 및 안전 예금 요건 평가",
      landlordCommunicationFactor: "임주인 커뮤니케이션 패턴 평가",
      propertyVerificationFactor: "속성 정보 확인",
      scoreRangeExplanation:
        "점수 80-100은 신뢰할 수 있음을 간주하고, 50-79는 주의가 필요하며, 50 미만은 중요한 경고 신호를 보여줍니다.",
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
      highConcernClause: "উচ্চ ঝুঁকি",
      moderateConcernClause: "মাঝারি ঝুঁকি",
      detailedAnalysisDesc:
        "এই বিস্তারিত বিশ্লষণটি আপনার কিরায় সম্পন্ন ফাইলের বিশ্বাসযোগ্যতা এবং সম্ভাব্য জোখিমগুলি আকলন করেছে।",
      grade: "গ্রেড",
      riskLevel: "জোখিমের স্তর",
      algorithmExplainerIntro:
        "আমাদের অ্যালগোরিদম বিশ্বাসযোগ্যতা স্কোর উত্পন্ন করার জন্য বিভিন্ন উপাদান বিশ্লেষণ করে:",
      leaseAnalysisFactor: "কিরায় বিশ্লেষণ - সমস্যাপূর্ণ ক্লাউজ পন্থক করা",
      priceComparisonFactor: "বাজার দরের সাথে দাম তুলনা",
      paymentTermsFactor: "ভাড়া শর্তাবলী এবং সিকিউরিটি জমা আবশন পরিমাপ",
      landlordCommunicationFactor: "ভাড়ায়নী কমিউনিকেশন প্যাটার্ন পরিমাপ",
      propertyVerificationFactor: "প্রপার্টি তথ্য পরিশোধন",
      scoreRangeExplanation:
        "অংক 80-100 বিশ্বাসযোগ্য মনে করা হয়, 50-79 প্রয়োজন প্রয়োজন এবং 50 নীচে গুরুত্বপূর্ণ চিহ্ন দেখায়।",
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

  // Add this function near the formatExplanation function to highlight important keywords
  const highlightWarningWords = (text: string): string => {
    if (!text) return "";

    // Define warning words in different languages
    const warningWords = {
      english: [
        "scam",
        "fraud",
        "suspicious",
        "concerning",
        "red flag",
        "illegal",
        "warning",
        "caution",
        "risk",
        "dangerous",
        "misleading",
        "deceptive",
      ],
      spanish: [
        "estafa",
        "fraude",
        "sospechoso",
        "preocupante",
        "alerta",
        "ilegal",
        "advertencia",
        "precaución",
        "riesgo",
        "peligroso",
        "engañoso",
      ],
      chinese: [
        "欺诈",
        "骗局",
        "可疑",
        "担忧",
        "危险",
        "警告",
        "非法",
        "风险",
        "误导",
        "欺骗",
      ],
      hindi: [
        "धोखा",
        "जालसाजी",
        "संदिग्ध",
        "चिंताजनक",
        "खतरा",
        "गैरकानूनी",
        "चेतावनी",
        "जोखिम",
      ],
      korean: [
        "사기",
        "의심스러운",
        "불법",
        "위험",
        "경고",
        "주의",
        "리스크",
        "오해",
      ],
      bengali: [
        "প্রতারণা",
        "জালিয়াতি",
        "সন্দেহজনক",
        "উদ্বেগজনক",
        "বিপদ",
        "অবৈধ",
        "সতর্কতা",
      ],
    };

    // Select words based on current language
    const selectedWords =
      warningWords[language as keyof typeof warningWords] ||
      warningWords.english;

    // Replace warning words with highlighted versions
    let highlightedText = text;
    selectedWords.forEach((word) => {
      // Case-insensitive replacement with regex
      const regex = new RegExp(`(${word})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<span class="bg-red-900/30 text-red-300 px-1 rounded font-medium">$1</span>'
      );
    });

    return highlightedText;
  };

  // Add the unescapeText utility function at the top of the component
  const unescapeText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  // Update the formatExplanation function to use unescapeText
  const formatExplanation = (explanation: string): string => {
    if (!explanation) return "";

    // Clean up excess whitespace
    let formattedText = explanation.replace(/\n{3,}/g, "\n\n");

    // Remove escaped backslashes that appear in the text
    formattedText = unescapeText(formattedText);

    // Add paragraph breaks
    formattedText = formattedText
      .split("\n\n")
      .map((para) => `<p class="mb-3">${para.replace(/\n/g, " ")}</p>`)
      .join("");

    // Apply highlighting to warning words
    formattedText = highlightWarningWords(formattedText);

    return formattedText;
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
      // Apply unescapeText and then formatExplanation to ensure raw explanation is also properly unescaped
      return formatExplanation(unescapeText(rawData.explanation));
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
          {t.detailedAnalysisDesc}
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
            <div className="flex flex-col items-center mb-4 md:mb-0 relative">
              <div
                className={`text-6xl font-bold ${getScoreColor()} mb-2 transition-all duration-700 ease-in-out hover:scale-110 hover:brightness-110 relative z-10`}
                style={{
                  textShadow: "0 0 10px rgba(255,255,255,0.2)",
                  animation: "pulse 2s infinite",
                }}
              >
                {score}
                <style jsx>{`
                  @keyframes pulse {
                    0% {
                      transform: scale(1);
                    }
                    50% {
                      transform: scale(1.03);
                    }
                    100% {
                      transform: scale(1);
                    }
                  }
                `}</style>
              </div>
              <div className="text-sm text-gray-400">/ 100</div>

              {/* Score progress indicator - visual representation */}
              <div className="w-32 h-3 bg-gray-700 rounded-full mt-2 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${score}%`,
                    background: `linear-gradient(90deg, 
                      ${
                        score >= 70
                          ? "#34D399"
                          : score >= 45
                          ? "#FBBF24"
                          : "#F87171"
                      } 0%, 
                      ${
                        score >= 70
                          ? "#10B981"
                          : score >= 45
                          ? "#F59E0B"
                          : "#EF4444"
                      } 100%)`,
                  }}
                ></div>
              </div>
            </div>

            <div className="h-20 w-px bg-gray-700 hidden md:block"></div>

            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-400 uppercase mb-1">GRADE</div>
              <div
                className={`text-5xl font-bold ${getGradeColor()} transition-all duration-500 ease-in-out hover:scale-110 relative`}
                style={{
                  textShadow: "0 0 8px rgba(255,255,255,0.15)",
                }}
              >
                {grade}
                <span className="absolute -top-1 -right-1 text-xs bg-blue-500 rounded-full h-4 w-4 flex items-center justify-center animate-ping opacity-75"></span>
              </div>
            </div>

            <div className="h-20 w-px bg-gray-700 hidden md:block"></div>

            <div className="mt-4 md:mt-0">
              <div className="text-sm text-gray-400 uppercase mb-2">
                {t.riskLevel}
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
                <p>{t.algorithmExplainerIntro}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{t.leaseAnalysisFactor}</li>
                  <li>{t.priceComparisonFactor}</li>
                  <li>{t.paymentTermsFactor}</li>
                  <li>{t.landlordCommunicationFactor}</li>
                  <li>{t.propertyVerificationFactor}</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2 italic">
                  {t.scoreRangeExplanation}
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
            <div
              className="text-gray-300 bg-gray-900/30 p-4 rounded-lg border border-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayExplanation }}
            ></div>

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
                      <li key={i}>{unescapeText(item)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clauses analysis section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center">
            <span className="mr-2">📋</span> {t.clausesSummary}
          </h2>

          {results.simplified_clauses.length > 0 ? (
            <div className="space-y-3">
              {/* Add a "Normal Terms" section for non-concerning clauses */}
              {results.simplified_clauses.filter((c) => !c.is_concerning)
                .length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2 text-green-400">
                    Standard/Expected Terms
                  </h3>
                  <div className="space-y-2">
                    {results.simplified_clauses
                      .filter((c) => !c.is_concerning)
                      .map((clause, idx) => (
                        <div
                          key={`normal-clause-${idx}`}
                          className="bg-gray-800/70 p-3 rounded-lg border border-gray-700 hover:border-green-500 transition-all"
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1 text-green-400">✓</div>
                            <div>
                              <p className="text-gray-300 font-medium">
                                {unescapeText(clause.text)}
                              </p>
                              <p className="text-gray-400 text-sm mt-1">
                                {unescapeText(clause.simplified_text)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Concerning clauses section */}
              {results.simplified_clauses.filter((c) => c.is_concerning)
                .length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-2 text-yellow-400">
                    Clauses to Review
                  </h3>
                  <div className="space-y-2">
                    {results.simplified_clauses
                      .filter((c) => c.is_concerning)
                      .map((clause, idx) => (
                        <div
                          key={`clause-${idx}`}
                          className={`bg-gray-800/70 p-3 rounded-lg border border-gray-700 ${
                            expandedClause === idx
                              ? "border-yellow-500"
                              : "hover:border-gray-500"
                          } transition-all`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-1 text-yellow-400">⚠️</div>
                            <div>
                              <p className="text-gray-300 font-medium">
                                {unescapeText(clause.simplified_text)}
                              </p>
                              <div
                                className={`overflow-hidden transition-all ${
                                  expandedClause === idx
                                    ? "max-h-96 opacity-100 mt-3"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <p className="text-gray-300 text-sm">
                                  {unescapeText(clause.text)}
                                </p>
                                {clause.reason && (
                                  <p className="text-yellow-400 text-sm mt-1 italic">
                                    {unescapeText(clause.reason)}
                                  </p>
                                )}
                                {clause.california_law && (
                                  <p className="text-emerald-400 text-sm mt-2 border-t border-gray-700 pt-2">
                                    <span className="font-semibold">
                                      California Law:
                                    </span>{" "}
                                    {unescapeText(clause.california_law)}
                                  </p>
                                )}
                              </div>
                              <button
                                className="text-blue-400 text-xs mt-2 hover:underline"
                                onClick={() => toggleClauseExpansion(idx)}
                              >
                                {expandedClause === idx
                                  ? t.hideClauseDetail
                                  : t.viewClauseDetail}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No specific clauses were analyzed.</p>
          )}
        </div>

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
                  <span className="flex-1">{unescapeText(question)}</span>
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
                          {i + 1}. {unescapeText(q)}
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

        {/* Add California Tenant Rights section */}
        {results.california_tenant_rights &&
          (results.california_tenant_rights.relevant_statutes?.length > 0 ||
            results.california_tenant_rights.local_ordinances?.length > 0 ||
            results.california_tenant_rights.case_law?.length > 0) && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300 mb-8">
              <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-emerald-500/20 blur-xl animate-pulse-slow"></div>

              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                California Tenant Rights
                <span className="animate-float inline-block">📜</span>
              </h2>

              {results.california_tenant_rights.relevant_statutes?.length >
                0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-emerald-400 mb-2">
                    Relevant California Statutes
                  </h3>
                  <ul className="space-y-2 pl-2">
                    {results.california_tenant_rights.relevant_statutes.map(
                      (statute, idx) => (
                        <li
                          key={idx}
                          className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700"
                        >
                          {unescapeText(statute)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {results.california_tenant_rights.local_ordinances?.length >
                0 && (
                <div className="mb-4">
                  <h3 className="text-md font-semibold text-emerald-400 mb-2">
                    Local Ordinances
                  </h3>
                  <ul className="space-y-2 pl-2">
                    {results.california_tenant_rights.local_ordinances.map(
                      (ordinance, idx) => (
                        <li
                          key={idx}
                          className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700"
                        >
                          {unescapeText(ordinance)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {results.california_tenant_rights.case_law?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-emerald-400 mb-2">
                    Relevant Case Law
                  </h3>
                  <ul className="space-y-2 pl-2">
                    {results.california_tenant_rights.case_law.map(
                      (case_law, idx) => (
                        <li
                          key={idx}
                          className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700"
                        >
                          {unescapeText(case_law)}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
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
