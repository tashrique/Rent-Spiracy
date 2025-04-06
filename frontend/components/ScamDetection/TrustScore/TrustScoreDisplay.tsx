"use client";

import { useState } from "react";

type ScoreLikelihood = "Low" | "Medium" | "High";
type GradeType = "A" | "B" | "C" | "D" | "F";
type RiskLevelType =
  | "Low Risk"
  | "Medium Risk"
  | "High Risk"
  | "Very High Risk";

interface TrustScoreDisplayProps {
  language: string;
  scam_likelihood: ScoreLikelihood;
  trustworthiness_score?: number;
  trustworthiness_grade?: GradeType;
  risk_level?: RiskLevelType;
  simplified_clauses: {
    is_concerning: boolean;
  }[];
}

export default function TrustScoreDisplay({
  language,
  scam_likelihood,
  trustworthiness_score,
  trustworthiness_grade,
  risk_level,
  simplified_clauses,
}: TrustScoreDisplayProps) {
  const [showExplainer, setShowExplainer] = useState(false);

  // Calculate a numeric score based on the likelihood and concerning clauses (fallback)
  function getNumericScore() {
    // Base score from likelihood - MORE GENEROUS STARTING POINTS
    let score = 0;

    switch (scam_likelihood) {
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
    const concerningClausesCount = simplified_clauses.filter(
      (c) => c.is_concerning
    ).length;
    const totalClauses = simplified_clauses.length;

    if (totalClauses > 0) {
      // Deduct up to 8 points (reduced from 15) based on ratio of concerning clauses
      // Also added weighting to make penalties less severe
      const impactRatio = Math.min(0.8, concerningClausesCount / totalClauses);
      score -= Math.round(impactRatio * 8);
    }

    // Ensure score stays in range 0-100
    return Math.max(0, Math.min(100, score));
  }

  // Fallback letter grade calculation - MORE GENEROUS GRADING
  function getLetterGrade() {
    const score = trustworthiness_score || getNumericScore();
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
  }

  // Fallback risk level determination - MORE GENEROUS RISK LEVELS
  function getRiskLevel() {
    const score = trustworthiness_score || getNumericScore();
    if (score >= 70) return "Low Risk";
    if (score >= 45) return "Medium Risk";
    return "High Risk";
  }

  // Use API values if available, otherwise calculate
  const score = trustworthiness_score || getNumericScore();
  const grade = trustworthiness_grade || getLetterGrade();
  const riskLevel = risk_level || getRiskLevel();

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

  const getScoreTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Trustworthiness Score",
      spanish: "Puntuación de Confiabilidad",
      chinese: "可信度评分",
      hindi: "विश्वसनीयता स्कोर",
      korean: "신뢰도 점수",
      bengali: "বিশ্বাসযোগ্যতা স্কোর",
      swahili: "Alama ya Uaminifu",
      arabic: "درجة الموثوقية",
    };
    return texts[language as keyof typeof texts] || "Trustworthiness Score";
  };

  const getGradeTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Grade",
      spanish: "Calificación",
      chinese: "等级",
      hindi: "ग्रेड",
      korean: "등급",
      bengali: "গ্রেড",
      swahili: "Daraja",
      arabic: "الدرجة",
    };
    return texts[language as keyof typeof texts] || "Grade";
  };

  const getRiskLevelTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Risk Level",
      spanish: "Nivel de Riesgo",
      chinese: "风险级别",
      hindi: "जोखिम स्तर",
      korean: "위험 수준",
      bengali: "ঝুঁকির মাত্রা",
      swahili: "Kiwango cha Hatari",
      arabic: "مستوى الخطر",
    };
    return texts[language as keyof typeof texts] || "Risk Level";
  };

  const getExplainerButtonText = () => {
    const texts: { [key: string]: string } = {
      english: "Learn How Scores Work",
      spanish: "Aprenda Cómo Funcionan las Puntuaciones",
      chinese: "了解评分如何工作",
      hindi: "जानें स्कोर कैसे काम करते हैं",
      korean: "점수 계산 방식 알아보기",
      bengali: "স্কোর কীভাবে কাজ করে তা জানুন",
      swahili: "Jifunze Jinsi Alama Zinavyofanya Kazi",
      arabic: "تعرف على كيفية عمل النقاط",
    };
    return texts[language as keyof typeof texts] || "Learn How Scores Work";
  };

  const getExplainerTitle = () => {
    const texts: { [key: string]: string } = {
      english: "How Rental Trustworthiness Scores Work",
      spanish: "Cómo Funcionan las Puntuaciones de Confiabilidad de Alquiler",
      chinese: "租赁可信度评分的工作原理",
      hindi: "किराये की विश्वसनीयता स्कोर कैसे काम करते हैं",
      korean: "임대 신뢰도 점수 작동 방식",
      bengali: "ভাড়া বিশ্বাসযোগ্যতা স্কোর কীভাবে কাজ করে",
      swahili: "Jinsi Alama za Uaminifu wa Kukodisha Zinavyofanya Kazi",
      arabic: "كيف تعمل درجات موثوقية الإيجار",
    };
    return (
      texts[language as keyof typeof texts] ||
      "How Rental Trustworthiness Scores Work"
    );
  };

  const getExplainerIntroText = () => {
    const texts: { [key: string]: string } = {
      english:
        "Our algorithm analyzes multiple factors to generate a trustworthiness score:",
      spanish:
        "Nuestro algoritmo analiza múltiples factores para generar una puntuación de confiabilidad:",
      chinese: "我们的算法分析多种因素来生成可信度评分：",
      hindi:
        "हमारा एल्गोरिथम विश्वसनीयता स्कोर उत्पन्न करने के लिए कई कारकों का विश्लेषण करता है:",
      korean: "알고리즘은 여러 요소를 분석하여 신뢰도 점수를 생성합니다:",
      bengali:
        "আমাদের অ্যালগরিদম বিশ্বাসযোগ্যতা স্কোর তৈরি করতে একাধিক ফ্যাক্টর বিশ্লেষণ করে:",
      swahili:
        "Algoritimu yetu inachambua sababu nyingi ili kuzalisha alama ya uaminifu:",
      arabic: "يحلل خوارزميتنا عوامل متعددة لإنشاء درجة الموثوقية:",
    };
    return (
      texts[language as keyof typeof texts] ||
      "Our algorithm analyzes multiple factors to generate a trustworthiness score:"
    );
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

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">{getScoreTitle()}</h2>
          <button
            onClick={() => setShowExplainer(true)}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            <span className="text-lg">ⓘ</span>
            {getExplainerButtonText()}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trustworthiness Score */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="mb-2 text-gray-400 text-sm">{getScoreTitle()}</div>
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {score}
            </div>
          </div>

          {/* Grade */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="mb-2 text-gray-400 text-sm">{getGradeTitle()}</div>
            <div className={`text-4xl font-bold ${getGradeColor()}`}>
              {grade}
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="mb-2 text-gray-400 text-sm">
              {getRiskLevelTitle()}
            </div>
            <div
              className={`text-lg font-medium ${getLikelihoodColor(
                riskLevel.split(" ")[0]
              )}`}
            >
              {riskLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Score Explainer Modal */}
      {showExplainer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {getExplainerTitle()}
                </h3>
                <button
                  onClick={() => setShowExplainer(false)}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="text-gray-300 space-y-4">
                <p>{getExplainerIntroText()}</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Lease analysis - identifying problematic clauses</li>
                  <li>Price comparison with market rates</li>
                  <li>
                    Evaluation of payment terms and security deposit
                    requirements
                  </li>
                  <li>Assessment of landlord communication patterns</li>
                  <li>Property information verification</li>
                </ul>

                <p>
                  Scores 80-100 are considered trustworthy, 50-79 require
                  caution, and below 50 show significant warning signs.
                </p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowExplainer(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
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
