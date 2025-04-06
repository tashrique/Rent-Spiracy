"use client";

interface KeyLeaseTerms {
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
}

interface KeyLeaseTermsSectionProps {
  language: string;
  keyLeaseTerms?: KeyLeaseTerms;
}

export default function KeyLeaseTermsSection({
  language,
  keyLeaseTerms,
}: KeyLeaseTermsSectionProps) {
  if (!keyLeaseTerms) return null;

  const getTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Key Lease Terms Summary",
      spanish: "Resumen de Términos Clave del Contrato",
      chinese: "租约关键条款摘要",
      hindi: "पट्टे के प्रमुख नियमों का सारांश",
      korean: "임대 주요 조건 요약",
      bengali: "লিজের প্রধান শর্তাবলী সংক্ষিপ্তসার",
      swahili: "Muhtasari wa Masharti Muhimu ya Kukodisha",
      arabic: "ملخص شروط الإيجار الرئيسية",
    };
    return texts[language as keyof typeof texts] || "Key Lease Terms Summary";
  };

  const getRentSectionTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Rent",
      spanish: "Alquiler",
      chinese: "租金",
      hindi: "किराया",
      korean: "임대료",
      bengali: "ভাড়া",
      swahili: "Kodi",
      arabic: "الإيجار",
    };
    return texts[language as keyof typeof texts] || "Rent";
  };

  const getAmountLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Amount",
      spanish: "Cantidad",
      chinese: "金额",
      hindi: "राशि",
      korean: "금액",
      bengali: "পরিমাণ",
      swahili: "Kiasi",
      arabic: "المبلغ",
    };
    return texts[language as keyof typeof texts] || "Amount";
  };

  const getDueDateLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Due Date",
      spanish: "Fecha de Vencimiento",
      chinese: "到期日",
      hindi: "नियत तारीख",
      korean: "납부일",
      bengali: "নির্দিষ্ট তারিখ",
      swahili: "Tarehe ya Malipo",
      arabic: "تاريخ الاستحقاق",
    };
    return texts[language as keyof typeof texts] || "Due Date";
  };

  const getPaymentMethodLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Payment Method",
      spanish: "Método de Pago",
      chinese: "付款方式",
      hindi: "भुगतान का तरीका",
      korean: "지불 방법",
      bengali: "পেমেন্ট পদ্ধতি",
      swahili: "Njia ya Malipo",
      arabic: "طريقة الدفع",
    };
    return texts[language as keyof typeof texts] || "Payment Method";
  };

  const getSecurityDepositTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Security Deposit",
      spanish: "Depósito de Seguridad",
      chinese: "安全押金",
      hindi: "सुरक्षा जमा",
      korean: "보증금",
      bengali: "সিকিউরিটি ডিপোজিট",
      swahili: "Amana ya Usalama",
      arabic: "تأمين الوديعة",
    };
    return texts[language as keyof typeof texts] || "Security Deposit";
  };

  const getReturnConditionsLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Return Conditions",
      spanish: "Condiciones de Devolución",
      chinese: "退还条件",
      hindi: "वापसी की शर्तें",
      korean: "반환 조건",
      bengali: "ফেরত শর্তাবলী",
      swahili: "Masharti ya Kurejesha",
      arabic: "شروط الإرجاع",
    };
    return texts[language as keyof typeof texts] || "Return Conditions";
  };

  const getLeaseDurationTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Lease Duration",
      spanish: "Duración del Contrato",
      chinese: "租约期限",
      hindi: "पट्टे की अवधि",
      korean: "임대 기간",
      bengali: "লিজের সময়কাল",
      swahili: "Muda wa Kukodisha",
      arabic: "مدة الإيجار",
    };
    return texts[language as keyof typeof texts] || "Lease Duration";
  };

  const getStartDateLabel = () => {
    const texts: { [key: string]: string } = {
      english: "Start Date",
      spanish: "Fecha de Inicio",
      chinese: "开始日期",
      hindi: "आरंभ तिथि",
      korean: "시작일",
      bengali: "শুরুর তারিখ",
      swahili: "Tarehe ya Kuanza",
      arabic: "تاريخ البدء",
    };
    return texts[language as keyof typeof texts] || "Start Date";
  };

  const getEndDateLabel = () => {
    const texts: { [key: string]: string } = {
      english: "End Date",
      spanish: "Fecha de Finalización",
      chinese: "结束日期",
      hindi: "समाप्ति तिथि",
      korean: "종료일",
      bengali: "শেষ তারিখ",
      swahili: "Tarehe ya Mwisho",
      arabic: "تاريخ الانتهاء",
    };
    return texts[language as keyof typeof texts] || "End Date";
  };

  const getRenewalTerminationTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Renewal & Termination",
      spanish: "Renovación y Terminación",
      chinese: "续约与终止",
      hindi: "नवीनीकरण और समाप्ति",
      korean: "갱신 및 해지",
      bengali: "নবায়ন ও সমাপ্তি",
      swahili: "Upyaji na Kumalizika",
      arabic: "التجديد والإنهاء",
    };
    return texts[language as keyof typeof texts] || "Renewal & Termination";
  };

  const getMaintenanceTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Maintenance Responsibilities",
      spanish: "Responsabilidades de Mantenimiento",
      chinese: "维护责任",
      hindi: "रखरखाव की जिम्मेदारियां",
      korean: "유지 관리 책임",
      bengali: "রক্ষণাবেক্ষণের দায়িত্ব",
      swahili: "Majukumu ya Matengenezo",
      arabic: "مسؤوليات الصيانة",
    };
    return (
      texts[language as keyof typeof texts] || "Maintenance Responsibilities"
    );
  };

  const getUtilitiesTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Utilities",
      spanish: "Servicios Públicos",
      chinese: "公用事业",
      hindi: "उपयोगिताएँ",
      korean: "공공요금",
      bengali: "উপযোগিতা",
      swahili: "Huduma za Umeme na Maji",
      arabic: "المرافق",
    };
    return texts[language as keyof typeof texts] || "Utilities";
  };

  const getPetsTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Pet Policy",
      spanish: "Política de Mascotas",
      chinese: "宠物政策",
      hindi: "पालतू जानवर नीति",
      korean: "애완동물 정책",
      bengali: "পোষা প্রাণী নীতি",
      swahili: "Sera ya Wanyama Vipenzi",
      arabic: "سياسة الحيوانات الأليفة",
    };
    return texts[language as keyof typeof texts] || "Pet Policy";
  };

  const getLatePaymentTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Late Payment Policy",
      spanish: "Política de Pago Tardío",
      chinese: "逾期付款政策",
      hindi: "देर से भुगतान नीति",
      korean: "연체 정책",
      bengali: "বিলম্বিত পেমেন্ট নীতি",
      swahili: "Sera ya Malipo ya Kuchelewa",
      arabic: "سياسة الدفع المتأخر",
    };
    return texts[language as keyof typeof texts] || "Late Payment Policy";
  };

  const getEntryNoticeTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Landlord Entry Notice",
      spanish: "Aviso de Entrada del Propietario",
      chinese: "房东进入通知",
      hindi: "मकान मालिक के प्रवेश की सूचना",
      korean: "임대인 출입 통지",
      bengali: "বাড়িওয়ালার প্রবেশ নোটিশ",
      swahili: "Notisi ya Kuingia kwa Mmiliki",
      arabic: "إشعار دخول المالك",
    };
    return texts[language as keyof typeof texts] || "Landlord Entry Notice";
  };

  const getOtherTermsTitle = () => {
    const texts: { [key: string]: string } = {
      english: "Other Key Terms",
      spanish: "Otros Términos Clave",
      chinese: "其他关键条款",
      hindi: "अन्य प्रमुख शर्तें",
      korean: "기타 주요 조건",
      bengali: "অন্যান্য প্রধান শর্তাবলী",
      swahili: "Masharti Mengine Muhimu",
      arabic: "شروط رئيسية أخرى",
    };
    return texts[language as keyof typeof texts] || "Other Key Terms";
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">{getTitle()}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rent Section */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-green-400">💰</span>
              {getRentSectionTitle()}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">{getAmountLabel()}</p>
                <p className="text-white">{keyLeaseTerms.rent.amount || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">{getDueDateLabel()}</p>
                <p className="text-white">
                  {keyLeaseTerms.rent.due_date || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">
                  {getPaymentMethodLabel()}
                </p>
                <p className="text-white">
                  {keyLeaseTerms.rent.payment_method || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Security Deposit */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-yellow-400">🔐</span>
              {getSecurityDepositTitle()}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">{getAmountLabel()}</p>
                <p className="text-white">
                  {keyLeaseTerms.security_deposit.amount || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">
                  {getReturnConditionsLabel()}
                </p>
                <p className="text-white">
                  {keyLeaseTerms.security_deposit.return_conditions || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Duration */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-blue-400">📅</span>
              {getLeaseDurationTitle()}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">{getStartDateLabel()}</p>
                <p className="text-white">
                  {keyLeaseTerms.lease_duration.start_date || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">{getEndDateLabel()}</p>
                <p className="text-white">
                  {keyLeaseTerms.lease_duration.end_date || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Renewal/Termination */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-red-400">🔄</span>
              {getRenewalTerminationTitle()}
            </h3>
            <p className="text-white">
              {keyLeaseTerms.renewal_termination || "—"}
            </p>
          </div>

          {/* Maintenance */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-orange-400">🔧</span>
              {getMaintenanceTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.maintenance || "—"}</p>
          </div>

          {/* Utilities */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-blue-400">💡</span>
              {getUtilitiesTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.utilities || "—"}</p>
          </div>

          {/* Pets */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-purple-400">🐾</span>
              {getPetsTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.pets || "—"}</p>
          </div>

          {/* Late Payment */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-orange-400">⏰</span>
              {getLatePaymentTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.late_payment || "—"}</p>
          </div>

          {/* Entry Notice */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-green-400">🚪</span>
              {getEntryNoticeTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.entry_notice || "—"}</p>
          </div>

          {/* Other Key Terms */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
            <h3 className="font-semibold text-white text-lg mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="text-yellow-400">📝</span>
              {getOtherTermsTitle()}
            </h3>
            <p className="text-white">{keyLeaseTerms.other_key_terms || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
