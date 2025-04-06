"use client";

interface ActionItemsSectionProps {
  language: string;
  actionItems?: string[];
}

export default function ActionItemsSection({
  language,
  actionItems,
}: ActionItemsSectionProps) {
  // Skip rendering if no action items
  if (!actionItems || actionItems.length === 0) {
    return null;
  }

  // Get section title for different languages
  const getActionItemsTitle = () => {
    const titles: { [key: string]: string } = {
      english: "Recommended Actions",
      spanish: "Acciones Recomendadas",
      chinese: "建议的行动",
      hindi: "अनुशंसित कार्रवाई",
      korean: "권장 조치",
      bengali: "প্রস্তাবিত পদক্ষেপ",
      swahili: "Hatua Zinazopendekezwa",
      arabic: "الإجراءات الموصى بها",
    };
    return titles[language as keyof typeof titles] || "Recommended Actions";
  };

  // Helper function to unescape text
  const unescapeText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700 relative overflow-hidden group hover:border-indigo-500 transition-colors duration-300">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-indigo-500/20 blur-xl animate-pulse-slow"></div>

        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <span className="animate-float inline-block">✅</span>
          {getActionItemsTitle()}
        </h2>

        <div className="space-y-3">
          <ul className="space-y-3">
            {actionItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 bg-gray-900/30 p-3 rounded border border-gray-700 hover:border-indigo-500/50 transition-colors"
              >
                <span className="text-indigo-400 mt-0.5">•</span>
                <span className="text-gray-300">{unescapeText(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
