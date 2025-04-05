"use client";

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
  const translations = {
    english: {
      title: "Scam Detection Results",
      scamLikelihood: "Scam Likelihood",
      explanation: "Explanation",
      clausesSummary: "Lease Clauses Summary",
      suggestedQuestions: "Suggested Questions to Ask",
      backButton: "Check Another Rental",
      low: "Low",
      medium: "Medium",
      high: "High",
      concerningClause: "Concerning",
      normalClause: "Normal",
    },
    spanish: {
      title: "Resultados de Detección de Estafas",
      scamLikelihood: "Probabilidad de Estafa",
      explanation: "Explicación",
      clausesSummary: "Resumen de Cláusulas del Contrato",
      suggestedQuestions: "Preguntas Sugeridas para Hacer",
      backButton: "Verificar Otro Alquiler",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      concerningClause: "Preocupante",
      normalClause: "Normal",
    },
    chinese: {
      title: "诈骗检测结果",
      scamLikelihood: "诈骗可能性",
      explanation: "解释",
      clausesSummary: "租约条款摘要",
      suggestedQuestions: "建议问题",
      backButton: "检查另一个租赁",
      low: "低",
      medium: "中",
      high: "高",
      concerningClause: "值得关注",
      normalClause: "正常",
    },
    hindi: {
      title: "धोखाधड़ी का पता लगाने के परिणाम",
      scamLikelihood: "धोखाधड़ी की संभावना",
      explanation: "व्याख्या",
      clausesSummary: "लीज क्लॉज का सारांश",
      suggestedQuestions: "पूछने के लिए सुझाए गए प्रश्न",
      backButton: "एक और किराये की जांच करें",
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      concerningClause: "चिंताजनक",
      normalClause: "सामान्य",
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-xl font-semibold mb-3 text-white">
            {t.scamLikelihood}
          </h2>
          <div className="flex items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getLikelihoodColor(
                results.scam_likelihood
              )}`}
            >
              {getLikelihoodTranslation(results.scam_likelihood)}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2 text-gray-200">{t.explanation}</h3>
            <p className="text-gray-300">{results.explanation}</p>
          </div>
        </div>

        {results.simplified_clauses.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t.clausesSummary}
            </h2>
            <div className="space-y-4">
              {results.simplified_clauses.map((clause, index) => (
                <div
                  key={index}
                  className="border-b border-gray-700 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        clause.is_concerning
                          ? "bg-red-800 text-red-100"
                          : "bg-green-800 text-green-100"
                      }`}
                    >
                      {clause.is_concerning
                        ? t.concerningClause
                        : t.normalClause}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{clause.text}</p>
                  <p className="text-gray-200">{clause.simplified_text}</p>
                  {clause.is_concerning && clause.reason && (
                    <p className="mt-2 text-sm text-red-400">{clause.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.suggested_questions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t.suggestedQuestions}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {results.suggested_questions.map((question, index) => (
                <li key={index} className="text-gray-300">
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
          >
            {t.backButton}
          </button>
        </div>
      </div>
    </div>
  );
}
