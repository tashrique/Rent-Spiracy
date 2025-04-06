"use client";

interface TenantRightsSectionProps {
  language: string;
  tenantRights?: {
    relevant_statutes: string[];
    local_ordinances: string[];
    case_law: string[];
  };
}

export default function TenantRightsSection({
  language,
  tenantRights,
}: TenantRightsSectionProps) {
  // Skip rendering if no tenant rights data available
  if (
    !tenantRights ||
    ((!tenantRights.relevant_statutes ||
      tenantRights.relevant_statutes.length === 0) &&
      (!tenantRights.local_ordinances ||
        tenantRights.local_ordinances.length === 0) &&
      (!tenantRights.case_law || tenantRights.case_law.length === 0))
  ) {
    return null;
  }

  // Get location-based title
  const getLocationBasedTitle = () => {
    // First, try to detect location from the statutes if available
    if (
      tenantRights.relevant_statutes &&
      tenantRights.relevant_statutes.length > 0
    ) {
      // Get the first statute and check for common state patterns
      const firstStatute = tenantRights.relevant_statutes[0] || "";

      // Check for specific states
      const statePatterns = [
        {
          pattern: /california|cal\.\s+civ\.\s+code|cal\s+civil/i,
          name: "California",
        },
        { pattern: /new york|ny\s+real\s+prop|ny\s+rpl/i, name: "New York" },
        {
          pattern: /florida|fla\.\s+stat|florida\s+statutes/i,
          name: "Florida",
        },
        {
          pattern: /texas|tex\.\s+prop\.\s+code|texas\s+property/i,
          name: "Texas",
        },
        { pattern: /illinois|ilcs|illinois\s+compiled/i, name: "Illinois" },
        { pattern: /georgia|ga\.\s+code|georgia\s+code/i, name: "Georgia" },
        {
          pattern: /washington|wash\.\s+rev\.\s+code|rcw/i,
          name: "Washington",
        },
        {
          pattern: /massachusetts|mass\.\s+gen\.\s+laws/i,
          name: "Massachusetts",
        },
        { pattern: /michigan|mich\.\s+comp\.\s+laws/i, name: "Michigan" },
        { pattern: /ohio|ohio\s+rev\.\s+code/i, name: "Ohio" },
      ];

      for (const state of statePatterns) {
        if (state.pattern.test(firstStatute)) {
          // Map to translate state tenant rights titles
          const rightsTitlesByLanguage: { [key: string]: string } = {
            english: `${state.name} Tenant Rights`,
            spanish: `Derechos del Inquilino en ${state.name}`,
            chinese: `${state.name} 租户权利`,
            hindi: `${state.name} किरायेदार अधिकार`,
            korean: `${state.name} 세입자 권리`,
            bengali: `${state.name} ভাড়াটিয়া আইন`,
            swahili: `Haki za Mpangaji katika ${state.name}`,
            arabic: `حقوق المستأجر في ${state.name}`,
          };

          return (
            rightsTitlesByLanguage[
              language as keyof typeof rightsTitlesByLanguage
            ] || rightsTitlesByLanguage.english
          );
        }
      }
    }

    // Default titles by language
    const defaultTitles: { [key: string]: string } = {
      english: "Tenant Rights",
      spanish: "Derechos del Inquilino",
      chinese: "租户权利",
      hindi: "किरायेदार अधिकार",
      korean: "세입자 권리",
      bengali: "ভাড়াটিয়া আইনি অধিকার",
      swahili: "Haki za Mpangaji",
      arabic: "حقوق المستأجر",
    };

    return (
      defaultTitles[language as keyof typeof defaultTitles] ||
      defaultTitles.english
    );
  };

  // Get translations for section headings
  const getStatutesSectionTitle = () => {
    const titles: { [key: string]: string } = {
      english: "Relevant Statutes",
      spanish: "Estatutos Relevantes",
      chinese: "相关法规",
      hindi: "प्रासंगिक कानून",
      korean: "관련 법령",
      bengali: "প্রাসঙ্গিক আইন",
      swahili: "Sheria Zinazohusika",
      arabic: "التشريعات ذات الصلة",
    };
    return titles[language as keyof typeof titles] || "Relevant Statutes";
  };

  const getOrdinancesSectionTitle = () => {
    const titles: { [key: string]: string } = {
      english: "Local Ordinances",
      spanish: "Ordenanzas Locales",
      chinese: "当地条例",
      hindi: "स्थानीय अध्यादेश",
      korean: "지역 조례",
      bengali: "স্থানীয় অধ্যাদেশ",
      swahili: "Sheria za Mtaa",
      arabic: "الأنظمة المحلية",
    };
    return titles[language as keyof typeof titles] || "Local Ordinances";
  };

  const getCaseLawSectionTitle = () => {
    const titles: { [key: string]: string } = {
      english: "Relevant Case Law",
      spanish: "Jurisprudencia Relevante",
      chinese: "相关判例法",
      hindi: "प्रासंगिक केस कानून",
      korean: "관련 판례법",
      bengali: "প्रাসঙ্গিক মামলা আইন",
      swahili: "Sheria za Kesi Zinazohusika",
      arabic: "السوابق القضائية ذات الصلة",
    };
    return titles[language as keyof typeof titles] || "Relevant Case Law";
  };

  // Helper function to unescaper text
  const unescapeText = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700 relative overflow-hidden group hover:border-emerald-500 transition-colors duration-300">
        {/* Decorative elements */}
        <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-emerald-500/20 blur-xl animate-pulse-slow"></div>
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-blue-500/10 blur-xl"></div>

        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <span className="animate-float inline-block">📜</span>
          {getLocationBasedTitle()}
        </h2>

        {tenantRights.relevant_statutes?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-emerald-400 mb-2">
              {getStatutesSectionTitle()}
            </h3>
            <ul className="space-y-2">
              {tenantRights.relevant_statutes.map((statute, idx) => (
                <li
                  key={idx}
                  className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700 hover:border-emerald-500/50 transition-colors"
                >
                  {unescapeText(statute)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tenantRights.local_ordinances?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-emerald-400 mb-2">
              {getOrdinancesSectionTitle()}
            </h3>
            <ul className="space-y-2">
              {tenantRights.local_ordinances.map((ordinance, idx) => (
                <li
                  key={idx}
                  className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700 hover:border-emerald-500/50 transition-colors"
                >
                  {unescapeText(ordinance)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tenantRights.case_law?.length > 0 && (
          <div>
            <h3 className="text-md font-semibold text-emerald-400 mb-2">
              {getCaseLawSectionTitle()}
            </h3>
            <ul className="space-y-2">
              {tenantRights.case_law.map((caseLaw, idx) => (
                <li
                  key={idx}
                  className="text-gray-300 bg-gray-900/30 p-3 rounded border border-gray-700 hover:border-emerald-500/50 transition-colors"
                >
                  {unescapeText(caseLaw)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
