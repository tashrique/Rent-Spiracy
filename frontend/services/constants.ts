import { ScamDetectionResponse } from "./api";

// Fun quotes about scams in different languages
export const funQuotes = {
  english: [
    "If it sounds too good to be true, it probably comes with hidden cameras and a TV host.",
    "Scammers are like bad magicians - once you know the trick, the show's not so impressive.",
    "Remember: Your landlord should fix your leaky faucet, not your lottery tickets.",
    "A good deal shouldn't require your social security number AND your favorite childhood pet's name.",
  ],
  spanish: [
    "Si suena demasiado bueno para ser verdad, probablemente viene con cámaras ocultas y un presentador de televisión.",
    "Los estafadores son como malos magos: una vez que conoces el truco, el espectáculo no es tan impresionante.",
    "Recuerda: tu casero debería arreglar el grifo que gotea, no tus boletos de lotería.",
    "Un buen trato no debería requerir tu número de seguro social Y el nombre de tu mascota favorita de la infancia.",
  ],
  chinese: [
    "如果好得令人难以置信，那可能背后有摄像机和电视主持人。",
    "骗子就像糟糕的魔术师——一旦你知道了诀窍，表演就不那么令人印象深刻了。",
    "记住：房东应该修理漏水的水龙头，而不是彩票。",
    "一个好交易不应该需要你的社会安全号码和你童年最喜欢的宠物的名字。",
  ],
  hindi: [
    "अगर यह सच होने के लिए बहुत अच्छा लगता है, तो शायद इसमें छिपे हुए कैमरे और एक टीवी होस्ट हैं।",
    "घोटालेबाज बुरे जादूगरों की तरह हैं - एक बार आप चाल जान लेते हैं, तो शो इतना प्रभावशाली नहीं रहता।",
    "याद रखें: आपके मकान मालिक को आपके रिसते नल को ठीक करना चाहिए, न कि आपके लॉटरी टिकट।",
    "एक अच्छी डील के लिए आपके सोश্योल सिक्योरिटी नंबर और आपके पसंदीदा बचपन के पालतू जानवर के नाम की आवश्यकता नहीं होनी चाहिए।",
  ],
  korean: [
    "너무 좋아서 사실이라고 믿기 어렵다면, 아마도 숨겨진 카메라와 TV 진행자가 있을 겁니다.",
    "사기꾼은 서투른 마술사와 같습니다 - 일단 트릭을 알면 쇼가 그렇게 인상적이지 않습니다.",
    "기억하세요: 집주인은 당신의 물이 새는 수도꼭지를 고쳐야 하지, 당신의 복권을 고치는 것이 아닙니다.",
    "좋은 거래는 당신의 사회보장번호와 어린 시절 좋아하던 애완동물의 이름을 요구해서는 안 됩니다.",
  ],
  bengali: [
    "যদি এটি সত্যিই খুব ভালো শোনায়, তাহলে সম্ভবত এতে লুকানো ক্যামেরা এবং একজন টিভি হোস্ট আছে।",
    "প্রতারকরা খারাপ জাদুকরদের মতো - একবার আপনি কৌশলটি জেনে গেলে, শোটি তেমন প্রভাবশালী নয়।",
    "মনে রাখবেন: আপনার বাড়িওয়ালা আপনার ফুটো কলের মেরামত করবে, আপনার লটারি টিকিট নয়।",
    "একটি ভালো চুক্তিতে আপনার সোশ্যাল সিকিউরিটি নম্বর এবং আপনার ছোটবেলার প্রিয় পোষা প্রাণীর নাম উভয়ই চাওয়া উচিত নয়।",
  ],
};


// Default mock results in case the API is not available
export const defaultMockResults: ScamDetectionResponse = {
    id: "123",
    created_at: "2021-01-01",
    scam_likelihood: "High",
    trustworthiness_score: 55,
    trustworthiness_grade: "D",
    risk_level: "High Risk",
    explanation:
      "This lease agreement, while appearing like a standard residential lease at first glance, contains several concerning clauses that raise red flags and warrant a medium scam likelihood rating. The combination of aggressive financial terms, limitations on tenant rights, and unusual requirements like wire transfers and certified mail notifications creates a sense of imbalance that favors the landlord excessively. While not definitively a scam, the document's cumulative effect suggests a landlord potentially seeking to exploit a tenant's unfamiliarity with their rights or eagerness to secure housing. The high application fee, demand for wire transfer (which is difficult to trace and recover), stringent late fees, and the landlord's broad right of entry without notice are particularly problematic. The clauses related to lead paint and the landlord's disclaimer of responsibility for tenant belongings, while not necessarily malicious, further contribute to the impression of a landlord seeking to minimize their own liability and maximize profit. The lack of specific local legal references also raises concerns. A thorough review with a lawyer specializing in tenant rights is strongly recommended before signing this lease.",
    simplified_clauses: [
      {
        text: "Tenant shall pay a non-refundable application fee of $500 via wire transfer within 24 hours of submitting application.",
        simplified_text:
          "You must pay a $500 non-refundable application fee through wire transfer within 1 day of applying.",
        is_concerning: true,
        reason:
          "Unusually high application fee and the requirement for wire transfer are red flags.",
      },
      {
        text: "Landlord may enter premises at any time without prior notice for inspection or maintenance purposes.",
        simplified_text:
          "The landlord can enter your home anytime without telling you first.",
        is_concerning: true,
        reason:
          "This violates standard tenant rights to reasonable notice before entry.",
      },
      {
        text: "Late payment of rent shall incur a fee of 15% of monthly rent plus $50 per day until paid in full.",
        simplified_text:
          "If your rent is late, you'll be charged 15% of your monthly rent plus $50 for each day it remains unpaid.",
        is_concerning: true,
        reason:
          "These late fees are excessive and may violate laws in many jurisdictions that limit late fees.",
      },
      {
        text: "Resident assumes full responsibility for all maintenance, including HVAC systems, appliances, plumbing, electrical systems, and structural elements.",
        simplified_text:
          "You're responsible for maintaining and repairing everything in the apartment, including major systems like heating and plumbing.",
        is_concerning: true,
        reason:
          "Landlords typically remain responsible for major building systems and structural elements. This clause shifts unreasonable burden to the tenant."
      },
      {
        text: "Late payment of rent shall incur a fee of 8% of monthly rent.",
        simplified_text:
          "If your rent is late, you'll be charged 8% of your monthly rent as a late fee.",
        is_concerning: true,
        reason:
          "This late fee is somewhat high but may be legal depending on your jurisdiction."
      },
      {
        text: "Security deposit shall be equal to two months' rent.",
        simplified_text:
          "Your security deposit is twice your monthly rent amount.",
        is_concerning: true,
        reason:
          "While legal in some areas, a two-month security deposit is higher than standard in many markets."
      },
      {
        text: "The premises shall be used solely as a residence for Tenant(s) named herein.",
        simplified_text:
          "Only the people named in this lease can live in the rental unit.",
        is_concerning: false
      },
      {
        text: "Tenant shall maintain the Premises in a clean and sanitary condition.",
        simplified_text:
          "You must keep the property clean and in good condition.",
        is_concerning: false
      },
      {
        text: "Tenant shall not disturb neighbors or other tenants.",
        simplified_text:
          "You must not cause disturbances that would bother your neighbors.",
        is_concerning: false
      }
    ],
    suggested_questions: [
      "Can I pay the security deposit after viewing the property in person?",
      "Can we modify the lease to require 24-hour notice before entry?",
      "Is the landlord willing to accept payment methods other than wire transfer?",
      "Can you provide references from current tenants?",
      "What is the justification for the $500 application fee?",
      "Does the property have lead paint? If so, what remediation has been done?",
      "Will you provide documentation of any previous damage to the unit before I move in?",
      "Is the late fee structure negotiable?"
    ],
    action_items: [
      "Consult with a lawyer specializing in tenant rights to review the lease agreement before signing.",
      "Request written clarification on the landlord's entry policy, ensuring it aligns with local laws regarding reasonable notice.",
      "Negotiate a lower security deposit and a more reasonable late fee structure.",
      "Insist on a secure payment method other than wire transfer, such as a cashier's check or money order.",
      "Request a detailed breakdown of the $500 application fee and inquire about its legality in your jurisdiction.",
      "Document the condition of the property thoroughly with photos and videos before moving in."
    ]
  };


export const translations = {
    english: {
      title: "Check Your Rental Agreement",
      subtitle: "Detect potential scams and problematic clauses in your lease",
      urlLabel: "Listing URL",
      addressLabel: "Property Address",
      fileLabel: "Upload Lease Document",
      fileHelp: "Supported formats: PDF, DOC, DOCX",
      photoLabel: "Upload Lease Photo",
      takePhotoLabel: "Take Photo",
      galleryLabel: "Choose from Gallery",
      submitButton: "Analyze Now",
      atLeastOneField: "Please provide at least one: URL, address, or document",
      submittingText: "Analyzing... This may take a moment",
      errorText: "An error occurred. Please try again.",
      analysisStage1: "Uploading and extracting document content...",
      analysisStage2: "Identifying potential concerning clauses...",
      analysisStage3: "Analyzing for potential scam indicators...",
      analysisStage4: "Finalizing the lease analysis...",
      legalDisclaimer: "This tool is not a legal document and does not provide legal advice. It is intended for informational purposes only.",
    },
    spanish: {
      title: "Verifica Tu Contrato de Alquiler",
      subtitle:
        "Detecta posibles estafas y cláusulas problemáticas en tu contrato",
      urlLabel: "URL del Anuncio",
      addressLabel: "Dirección de la Propiedad",
      fileLabel: "Cargar Documento de Contrato",
      fileHelp: "Formatos soportados: PDF, DOC, DOCX",
      photoLabel: "Subir Foto del Contrato",
      takePhotoLabel: "Tomar Foto",
      galleryLabel: "Elegir de la Galería",
      submitButton: "Analizar Ahora",
      atLeastOneField:
        "Por favor proporciona al menos uno: URL, dirección o documento",
      submittingText: "Analizando... Esto puede tomar un momento",
      errorText: "Ocurrió un error. Por favor, inténtalo de nuevo.",
      analysisStage1: "Subiendo y extrayendo el contenido del documento...",
      analysisStage2: "Identificando cláusulas potencialmente preocupantes...",
      analysisStage3: "Analizando indicadores de posibles estafas...",
      analysisStage4: "Finalizando el análisis del contrato...",
      legalDisclaimer: "Este herramienta no es un documento legal y no proporciona asesoría legal. Está destinado únicamente a propósitos informativos.",
    },
    chinese: {
      title: "检查您的租赁协议",
      subtitle: "检测租约中潜在的诈骗和问题条款",
      urlLabel: "房源链接",
      addressLabel: "房产地址",
      fileLabel: "上传租约文件",
      fileHelp: "支持的格式：PDF、DOC、DOCX",
      photoLabel: "上传租约照片",
      takePhotoLabel: "拍照",
      galleryLabel: "从相册选择",
      submitButton: "立即分析",
      atLeastOneField: "请至少提供以下之一：链接、地址或文件",
      submittingText: "分析中...这可能需要一点时间",
      errorText: "发生错误。请再试一次。",
      analysisStage1: "上传和提取文档内容...",
      analysisStage2: "识别潜在的令人担忧的条款...",
      analysisStage3: "分析潜在的欺诈指标...",
      analysisStage4: "完成租约分析...",
      legalDisclaimer: "此工具不是法律文件，不提供法律建议。仅用于信息目的。",
    },
    hindi: {
      title: "अपने किराया अनुबंध की जांच करें",
      subtitle:
        "अपने लीज़ में संभावित धोखाधड़ी और समस्याग्रस्त खंडों का पता लगाएं",
      urlLabel: "लिस्टिंग यूआरएल",
      addressLabel: "संपत्ति का पता",
      fileLabel: "लीज़ दस्तावेज़ अपलोड करें",
      fileHelp: "समर्थित प्रारूप: PDF, DOC, DOCX",
      submitButton: "अभी विश्लेषण करें",
      atLeastOneField: "कृपया कम से कम एक प्रदान करें: URL, पता, या दस्तावेज़",
      submittingText: "विश्लेषण हो रहा है... इसमें कुछ समय लग सकता है",
      errorText: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
      analysisStage1: "दस्तावेज़ सामग्री अपलोड और निकाल रहा है...",
      analysisStage2: "संभावित चिंताजनक खंडों की पहचान कर रहा है...",
      analysisStage3: "संभावित धोखाधड़ी संकेतकों का विश्लेषण कर रहा है...",
      analysisStage4: "पट्टे का विश्लेषण पूरा कर रहा है...",
      legalDisclaimer: "यह टूल एक कानूनी दस्तावेज़ नहीं है और कानूनी सलाह नहीं देता है। इसका उद्देश्य केवल जानकारी के लिए है।",
    },
    korean: {
      title: "임대 계약서 확인하기",
      subtitle: "임대 계약서의 잠재적 사기와 문제가 있는 조항 탐지",
      urlLabel: "매물 URL",
      addressLabel: "부동산 주소",
      fileLabel: "임대 계약서 업로드",
      fileHelp: "지원 형식: PDF, DOC, DOCX",
      submitButton: "지금 분석하기",
      atLeastOneField: "URL, 주소 또는 문서 중 하나 이상을 제공해주세요",
      submittingText: "분석 중... 잠시 기다려주세요",
      errorText: "오류가 발생했습니다. 다시 시도해주세요.",
      analysisStage1: "문서 내용 업로드 및 추출 중...",
      analysisStage2: "잠재적으로 우려되는 조항 식별 중...",
      analysisStage3: "잠재적 사기 지표 분석 중...",
      analysisStage4: "임대 계약 분석 마무리 중...",
      legalDisclaimer: "이 도구는 법률 문서가 아니며 법률 조언을 제공하지 않습니다. 정보 목적으로만 사용됩니다.",
    },
    bengali: {
      title: "আপনার ভাড়ার চুক্তি যাচাই করুন",
      subtitle: "আপনার লিজে সম্ভাব্য প্রতারণা এবং সমস্যাযুক্ত ধারা সনাক্ত করুন",
      urlLabel: "লিস্টিং URL",
      addressLabel: "সম্পত্তির ঠিকানা",
      fileLabel: "লিজ ডকুমেন্ট আপলোড করুন",
      fileHelp: "সমর্থিত ফরম্যাট: PDF, DOC, DOCX",
      submitButton: "এখনই বিশ্লেষণ করুন",
      atLeastOneField: "অনুগ্রহ করে কমপক্ষে একটি দিন: URL, ঠিকানা, বা ডকুমেন্ট",
      submittingText: "বিশ্লেষণ করা হচ্ছে... এটি কিছুক্ষণ সময় নিতে পারে",
      errorText: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      analysisStage1: "নথি সামগ্রী আপলোড এবং নিষ্কাশন করা হচ্ছে...",
      analysisStage2: "সম্ভাব্য উদ্বেগজনক ধারাগুলি চিহ্নিত করা হচ্ছে...",
      analysisStage3: "সম্ভাব্য প্রতারণা সূচক বিশ্লেষণ করা হচ্ছে...",
      analysisStage4: "লিজ বিশ্লেষণ চূড়ান্ত করা হচ্ছে...",
      legalDisclaimer: "এই টুল একটি কানুনী দস্তাবেজ নয় এবং কানুনী সালাউট নয়। এটি শুধুমাত্র তথ্যপ্রদানের জন্য",
    },
    swahili: {
      title: "Angalia Mkataba Wako wa Kukodisha",
      subtitle: "Gundua ulaghai unaowezekana na vipengele vyenye matatizo katika kukodisha kwako",
      urlLabel: "URL ya Orodha",
      addressLabel: "Anwani ya Mali",
      fileLabel: "Pakia Hati ya Kukodisha",
      fileHelp: "Fomati zinazotumika: PDF, DOC, DOCX",
      photoLabel: "Pakia Picha ya Kukodisha",
      takePhotoLabel: "Piga Picha",
      galleryLabel: "Chagua kutoka Galeri",
      submitButton: "Changanua Sasa",
      atLeastOneField: "Tafadhali toa angalau moja: URL, anwani, au hati",
      submittingText: "Uchanganuzi... Hii inaweza kuchukua muda",
      errorText: "Hitilafu imetokea. Tafadhali jaribu tena.",
      analysisStage1: "Kupakia na kuchimba maudhui ya hati...",
      analysisStage2: "Kutambua vipengele vinavyoweza kusumbua...",
      analysisStage3: "Kuchanganua viashiria vya ulaghai unaowezekana...",
      analysisStage4: "Kumalizia uchambuzi wa kukodisha...",
      legalDisclaimer: "Chombo hiki si hati ya kisheria na haitoi ushauri wa kisheria. Inakusudiwa kwa madhumuni ya habari pekee.",
    },
    arabic: {
      title: "تحقق من اتفاقية الإيجار الخاصة بك",
      subtitle: "اكتشف عمليات الاحتيال المحتملة والبنود الإشكالية في عقد الإيجار الخاص بك",
      urlLabel: "رابط القائمة",
      addressLabel: "عنوان العقار",
      fileLabel: "تحميل وثيقة الإيجار",
      fileHelp: "التنسيقات المدعومة: PDF، DOC، DOCX",
      photoLabel: "تحميل صورة عقد الإيجار",
      takePhotoLabel: "التقط صورة",
      galleryLabel: "اختر من المعرض",
      submitButton: "تحليل الآن",
      atLeastOneField: "يرجى تقديم واحد على الأقل: رابط، عنوان، أو وثيقة",
      submittingText: "جاري التحليل... قد يستغرق هذا لحظة",
      errorText: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      analysisStage1: "تحميل واستخراج محتوى الوثيقة...",
      analysisStage2: "تحديد البنود المثيرة للقلق المحتملة...",
      analysisStage3: "تحليل مؤشرات الاحتيال المحتملة...",
      analysisStage4: "الانتهاء من تحليل عقد الإيجار...",
      legalDisclaimer: "هذه الأداة ليست وثيقة قانونية ولا تقدم مشورة قانونية. وهي مخصصة لأغراض إعلامية فقط.",
    },
  };