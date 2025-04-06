"use client";

import { useState } from "react";

interface SuggestedQuestionsListProps {
  language: string;
  questions: string[];
}

export default function SuggestedQuestionsList({
  language,
  questions,
}: SuggestedQuestionsListProps) {
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleSaveQuestion = (question: string) => {
    if (savedQuestions.includes(question)) {
      setSavedQuestions(savedQuestions.filter((q) => q !== question));
    } else {
      setSavedQuestions([...savedQuestions, question]);
    }
  };

  const copyQuestionsToClipboard = () => {
    const text =
      savedQuestions.length > 0
        ? savedQuestions.join("\n\n")
        : questions.join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Translation functions
  const getQuestionsTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Recommended Questions",
      spanish: "Preguntas Recomendadas",
      chinese: "推荐问题",
      hindi: "अनुशंसित प्रश्न",
      korean: "추천 질문",
      bengali: "প্রস্তাবিত প্রশ্ন",
      swahili: "Maswali Yaliyopendekezwa",
      arabic: "الأسئلة الموصى بها",
    };
    return texts[language as keyof typeof texts] || "Recommended Questions";
  };

  const getSaveText = () => {
    const texts: { [key: string]: string } = {
      english: "Save",
      spanish: "Guardar",
      chinese: "保存",
      hindi: "सहेजें",
      korean: "저장",
      bengali: "সংরক্ষণ",
      swahili: "Hifadhi",
      arabic: "حفظ",
    };
    return texts[language as keyof typeof texts] || "Save";
  };

  const getUnsaveText = () => {
    const texts: { [key: string]: string } = {
      english: "Unsave",
      spanish: "Quitar",
      chinese: "取消保存",
      hindi: "हटाएं",
      korean: "저장 취소",
      bengali: "অসংরক্ষণ",
      swahili: "Ondoa",
      arabic: "إلغاء الحفظ",
    };
    return texts[language as keyof typeof texts] || "Unsave";
  };

  const getSavedQuestionsTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Your Saved Questions",
      spanish: "Sus Preguntas Guardadas",
      chinese: "您已保存的问题",
      hindi: "आपके सहेजे गए प्रश्न",
      korean: "저장된 질문",
      bengali: "আপনার সংরক্ষিত প্রশ্ন",
      swahili: "Maswali Yako Yaliyohifadhiwa",
      arabic: "أسئلتك المحفوظة",
    };
    return texts[language as keyof typeof texts] || "Your Saved Questions";
  };

  const getNoSavedQuestionsText = () => {
    const texts: { [key: string]: string } = {
      english: "Save important questions for reference",
      spanish: "Guarde preguntas importantes para referencia",
      chinese: "保存重要问题以供参考",
      hindi: "संदर्भ के लिए महत्वपूर्ण प्रश्न सहेजें",
      korean: "참고용으로 중요한 질문 저장",
      bengali: "রেফারেন্সের জন্য গুরুত্বপূর্ণ প্রশ্ন সংরক্ষণ করুন",
      swahili: "Hifadhi maswali muhimu kwa kumbukumbu",
      arabic: "احفظ الأسئلة المهمة للرجوع إليها",
    };
    return (
      texts[language as keyof typeof texts] ||
      "Save important questions for reference"
    );
  };

  const getCopyText = () => {
    const texts: { [key: string]: string } = {
      english: "Copy",
      spanish: "Copiar",
      chinese: "复制",
      hindi: "कॉपी करें",
      korean: "복사",
      bengali: "কপি",
      swahili: "Nakili",
      arabic: "نسخ",
    };
    return texts[language as keyof typeof texts] || "Copy";
  };

  const getCopiedText = () => {
    const texts: { [key: string]: string } = {
      english: "Copied!",
      spanish: "¡Copiado!",
      chinese: "已复制！",
      hindi: "कॉपी हो गया!",
      korean: "복사됨!",
      bengali: "কপি করা হয়েছে!",
      swahili: "Imenakiliwa!",
      arabic: "تم النسخ!",
    };
    return texts[language as keyof typeof texts] || "Copied!";
  };

  const getEmailText = () => {
    const texts: { [key: string]: string } = {
      english: "Email these questions",
      spanish: "Enviar estas preguntas por correo",
      chinese: "通过电子邮件发送这些问题",
      hindi: "इन प्रश्नों को ईमेल करें",
      korean: "이 질문들을 이메일로 보내기",
      bengali: "এই প্রশ্নগুলি ইমেল করুন",
      swahili: "Tuma maswali haya kwa barua pepe",
      arabic: "إرسال هذه الأسئلة بالبريد الإلكتروني",
    };
    return texts[language as keyof typeof texts] || "Email these questions";
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">
          {getQuestionsTitle()}
        </h2>

        <div className="space-y-4 mb-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex justify-between items-start gap-3"
            >
              <div className="text-white flex-1">{question}</div>
              <button
                onClick={() => toggleSaveQuestion(question)}
                className={`flex-shrink-0 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  savedQuestions.includes(question)
                    ? "bg-blue-700 hover:bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {savedQuestions.includes(question)
                  ? getUnsaveText()
                  : getSaveText()}
              </button>
            </div>
          ))}
        </div>

        {/* Saved Questions Section */}
        {savedQuestions.length > 0 && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {getSavedQuestionsTitle()}
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
              <ul className="list-disc pl-5 space-y-3 text-white">
                {savedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyQuestionsToClipboard}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{copied ? getCopiedText() : getCopyText()}</span>
                {copied ? "✓" : "📋"}
              </button>

              <a
                href={`mailto:?subject=Questions about rental&body=${encodeURIComponent(
                  savedQuestions.join("\n\n")
                )}`}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>{getEmailText()}</span>
                <span>📧</span>
              </a>
            </div>
          </div>
        )}

        {/* No Saved Questions Placeholder */}
        {savedQuestions.length === 0 && (
          <div className="mt-6 text-center text-gray-400 py-6 border border-dashed border-gray-700 rounded-lg">
            <div className="text-3xl mb-2">📝</div>
            <p>{getNoSavedQuestionsText()}</p>
            <button
              onClick={copyQuestionsToClipboard}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <span>{copied ? getCopiedText() : getCopyText()} All</span>
              {copied ? "✓" : "📋"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
