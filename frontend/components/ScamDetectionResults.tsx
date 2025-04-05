"use client";

import { useState } from "react";

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
    explanation: string;
    simplified_clauses: Clause[];
    suggested_questions: string[];
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

  // Calculate a numeric score based on the likelihood and concerning clauses
  const getNumericScore = () => {
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
  };

  const score = getNumericScore();

  // Get color for score display
  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
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

  const getLetterGrade = () => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

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
        "सावधानी से आगे बढ़ें। हम किसी भी भुगतान करने से पहले व्यक्तिगत रूप से संपत्ति देखने और सभी समझौतों को लिखित रूप में प्राप्त करने की सलाह देते हैं।",
      highRiskAdvice:
        "इस किराये में संभावित धोखाधड़ी के कई चेतावनी संकेत दिखाए गए हैं। हम दृढ़ता से आगे की पुष्टि होने तक किसी भी भुगतान या व्यक्तिगत जानकारी साझा करने से बचने की सलाह देते हैं।",
      explainerButton: "जानें कैसे स्कोर काम करते हैं",
      explainerTitle: "किराया विश्वसनीयता स्कोर कैसे काम करते हैं",
      copyToClipboard: "कॉपी करें",
      copied: "कॉपी हो गया!",
      emailQuestions: "इन प्रश्नों को ईमेल करें",
      noSavedQuestionsYet: "संदर्भ के लिए महत्वपूर्ण प्रश्न सहेजें",
    },
  };

  const t =
    translations[language as keyof typeof translations] || translations.english;

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "Low":
        return "bg-green-800 text-green-100";
      case "Medium":
        return "bg-yellow-700 text-yellow-100";
      case "High":
        return "bg-red-800 text-red-100";
      default:
        return "bg-gray-700 text-gray-100";
    }
  };

  const getLikelihoodTranslation = (likelihood: string) => {
    switch (likelihood) {
      case "Low":
        return t.low;
      case "Medium":
        return t.medium;
      case "High":
        return t.high;
      default:
        return likelihood;
    }
  };

  const getAdviceForRiskLevel = () => {
    switch (results.scam_likelihood) {
      case "Low":
        return t.lowRiskAdvice;
      case "Medium":
        return t.mediumRiskAdvice;
      case "High":
        return t.highRiskAdvice;
      default:
        return t.mediumRiskAdvice;
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
              <div className={`text-5xl font-bold ${getScoreColor()}`}>
                {getLetterGrade()}
              </div>
            </div>

            <div className="h-20 w-px bg-gray-700 hidden md:block"></div>

            <div className="mt-4 md:mt-0">
              <div className="text-sm text-gray-400 uppercase mb-2">
                Risk Level
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium transform transition-transform hover:scale-105 ${getLikelihoodColor(
                  results.scam_likelihood
                )}`}
              >
                {getLikelihoodTranslation(results.scam_likelihood)}
              </span>
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
            <p className="text-gray-300">{results.explanation}</p>

            <div className="mt-6">
              <button
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                onClick={() => setShowAdvice(!showAdvice)}
              >
                <span>{showAdvice ? t.adviceClose : t.adviceShow}</span>
                <span>{showAdvice ? "▲" : "▼"}</span>
              </button>

              {showAdvice && (
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 animate-bounceIn">
                  <h4 className="font-medium text-white mb-2">
                    {t.adviceTitle}
                  </h4>
                  <p className="text-gray-300">{getAdviceForRiskLevel()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lease Clauses Analysis */}
        {results.simplified_clauses.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 relative overflow-hidden group hover:border-blue-500 transition-colors duration-300">
            <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-purple-500/20 blur-xl animate-float"></div>

            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              {t.clausesSummary}
              <span className="animate-float inline-block">📋</span>
            </h2>
            <div className="space-y-4">
              {results.simplified_clauses.map((clause, index) => (
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
        {results.suggested_questions.length > 0 && (
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
              {results.suggested_questions.map((question, index) => (
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
          {t.legalDisclaimer}: This assessment is based on automated analysis
          and may not catch all scams or lease issues. Always exercise caution
          and consider professional legal advice when needed.
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
