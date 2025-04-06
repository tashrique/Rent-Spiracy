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
    "एक अच्छी डील के लिए आपके सोश्योल सिक्योरिटी नंबर और आपके पसंदीदा बचपन के पालतू जानवर के नाम की आवश्यकता नहीं होनी चाहिए।",
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
  swahili: [
    "Ikiwa inaonekana nzuri sana kuwa ya kweli, pengine ina kamera zilizofichwa na mwenyeji wa TV.",
    "Walaghai ni kama wachawi wabaya - mara tu unapojua mbinu, onesha haionekani madhubuti sana.",
    "Kumbuka: Mwenye nyumba wako anapaswa kurekebisha mfereji wako unaovuja, sio tikiti zako za bahati nasibu.",
    "Biashara nzuri haipaswi kuhitaji nambari yako ya usalama wa jamii NA jina la mnyama wako mpendwa wa utotoni.",
  ],
  arabic: [
    "إذا كان الأمر يبدو جيدًا لدرجة يصعب تصديقها، فربما يأتي مع كاميرات مخفية ومقدم تلفزيوني.",
    "المحتالون مثل السحرة السيئين - بمجرد معرفة الحيلة، لم يعد العرض مثيرًا للإعجاب.",
    "تذكر: يجب على مالك العقار إصلاح الصنبور المتسرب، وليس تذاكر اليانصيب الخاصة بك.",
    "الصفقة الجيدة لا ينبغي أن تتطلب رقم الضمان الاجتماعي الخاص بك واسم حيوانك الأليف المفضل في طفولتك.",
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
      title: "Verificar Información del Arrendador",
      subtitle: "Verifica con quién estás tratando. Busca en nuestra base de datos de arrendadores problemáticos reportados antes de firmar cualquier cosa.",
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
        "आप किसके साथ व्यवहार कर रहे हैं, इसकी पुष्टि करें। कुछ भी हस्ताक्षर करने से पहले हमारे डेटाबेस में रिपोर्ट किए गए समस्याग्रस्त मकान मालिकों की खोज करें।",
      urlLabel: "लिस्टिंग यूआरएल",
      addressLabel: "संपत्ति का पता",
      fileLabel: "लीज़ दस्तावेज़ अपलोड करें",
      fileHelp: "समर्थित प्रारूप: PDF, DOC, DOCX",
      submitButton: "खोजें",
      atLeastOneField: "कृपया कम से कम एक प्रदान करें: URL, पता, या दस्तावेज़",
      submittingText: "खोज रहे हैं...",
      errorText: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
      analysisStage1: "दस्तावेज़ सामग्री अपलोड एवं निकाल रहा है...",
      analysisStage2: "संभावित चिंताजनक खंडों की पहचान कर रहा है...",
      analysisStage3: "संभावित धोखाधड़ी संकेतकों का विश्लेषण कर रहा है...",
      analysisStage4: "पट्टे का विश्लेषण पूरा कर रहा है...",
      legalDisclaimer: "यह टूल एक कानूनी दस्तावेज़ नहीं है और कानूनी सलाउट नहीं देता है। इसका उद्देश्य केवल जानकारी के लिए है।",
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
      title: "Angalia Maelezo ya Mmiliki",
      subtitle: "Thibitisha ni nani unayeshughulika naye. Tafuta katika hifadhidata yetu ya wamiliki wenye matatizo walioripotiwa kabla ya kutia saini chochote.",
      nameLabel: "Jina la Mmiliki",
      emailLabel: "Anwani ya Barua pepe",
      phoneLabel: "Nambari ya Simu",
      addressLabel: "Anwani ya Mali",
      searchButton: "Tafuta",
      searchingText: "Inatafuta...",
      clearButton: "Futa",
      noResultsTitle: "Hakuna wamiliki wa mashaka waliopatikana kulingana na vigezo vyako.",
      noResultsSubtitle: "Hii haidhaminishi usalama. Daima thibitisha hati.",
      resultsTitle: "Matokeo ya Utafutaji",
      emailText: "Barua pepe:",
      phoneText: "Simu:",
      addressesText: "Anwani zinazojulikana:",
      flagsText: "Alama za tahadhari:",
      reportedText: "Imeripotiwa",
      timesText: "mara",
      errorText: "Tafadhali ingiza angalau kigezo kimoja cha utafutaji",
      // Report modal translations
      reportButton: "Ripoti mtu huyu",
      reportModalTitle: "Ripoti Mpangishaji Anayeshukiwa",
      reportingPerson: "Unaripoti:",
      reportCurrentCount: "Idadi ya ripoti za sasa:",
      reportEvidenceNote: "Tafadhali toa ushahidi kama vile hati za kukodisha, picha za mawasiliano, au ushahidi mwingine wowote unaoiunga mkono ripoti yako.",
      reportUploadEvidence: "Pakia Ushahidi",
      reportBrowseFiles: "Vinjari faili",
      reportUploadedFiles: "Faili zilizopakiwa",
      reportNoFilesError: "Tafadhali pakia hati angalau moja kama ushahidi",
      reportVerifyingYourSubmission: "Tunathibitisha uwasilishaji wako na kuchambua ushahidi uliopakiwa.",
      reportVerifyingFiles: "Kuthibitisha faili zilizopakiwa...",
      reportAnalyzingContent: "Kuchambua maudhui ya hati...",
      reportCheckingMetadata: "Kuangalia metadata ya hati...",
      reportValidatingEvidence: "Kuthibitisha ushahidi...",
      reportConfirmingIdentity: "Kuthibitisha utambulisho wako...",
      reportProcessing: "Inachakata...",
      reportThankYou: "Asante!",
      reportSuccessMessage: "Ripoti imewasilishwa kwa mafanikio. Timu yetu itaangalia ushahidi wako.",
      reportErrorMessage: "Hitilafu imetokea wakati wa kuwasilisha ripoti yako. Tafadhali jaribu tena.",
      reportUpdatedCount: "Idadi ya ripoti iliyosasishwa",
      cancelButton: "Ghairi",
      continueButton: "Endelea",
      verifyAndSubmitButton: "Thibitisha na Wasilisha",
      submittingText: "Inawasilisha...",
      closeButton: "Funga"
    },
    arabic: {
      title: "التحقق من معلومات المؤجر",
      subtitle: "تحقق ممن تتعامل معه. ابحث في قاعدة بياناتنا عن المؤجرين المشكلين الذين تم الإبلاغ عنهم قبل التوقيع على أي شيء.",
      nameLabel: "اسم المؤجر",
      emailLabel: "البريد الإلكتروني",
      phoneLabel: "رقم الهاتف",
      addressLabel: "عنوان العقار",
      searchButton: "بحث",
      searchingText: "جارٍ البحث...",
      clearButton: "مسح",
      noResultsTitle: "لم يتم العثور على مؤجرين مشبوهين مطابقين لمعاييرك.",
      noResultsSubtitle: "هذا لا يضمن السلامة. تحقق دائمًا من بيانات الاعتماد.",
      resultsTitle: "نتائج البحث",
      emailText: "البريد الإلكتروني:",
      phoneText: "الهاتف:",
      addressesText: "العناوين المعروفة:",
      flagsText: "علامات التحذير:",
      reportedText: "تم الإبلاغ",
      timesText: "مرات",
      errorText: "الرجاء إدخال معيار بحث واحد على الأقل",
      // Report modal translations
      reportButton: "الإبلاغ عن هذا الشخص",
      reportModalTitle: "الإبلاغ عن مؤجر مشبوه",
      reportingPerson: "أنت تبلغ عن:",
      reportCurrentCount: "عدد التقارير الحالية:",
      reportEvidenceNote: "يرجى تقديم أدلة مثل مستندات الإيجار أو لقطات الشاشة للمراسلات أو أي دليل آخر يدعم تقريرك.",
      reportUploadEvidence: "تحميل الأدلة",
      reportBrowseFiles: "تصفح الملفات",
      reportUploadedFiles: "الملفات المحملة",
      reportNoFilesError: "يرجى تحميل مستند واحد على الأقل كدليل",
      reportVerifyingYourSubmission: "نحن نتحقق من طلبك ونحلل الأدلة المحملة.",
      reportVerifyingFiles: "التحقق من الملفات المحملة...",
      reportAnalyzingContent: "تحليل محتوى المستند...",
      reportCheckingMetadata: "فحص البيانات الوصفية للمستند...",
      reportValidatingEvidence: "التحقق من الأدلة...",
      reportConfirmingIdentity: "تأكيد هويتك...",
      reportProcessing: "جاري المعالجة...",
      reportThankYou: "شكراً لك!",
      reportSuccessMessage: "تم تقديم التقرير بنجاح. سيقوم فريقنا بمراجعة الأدلة الخاصة بك.",
      reportErrorMessage: "حدث خطأ أثناء تقديم تقريرك. يرجى المحاولة مرة أخرى.",
      reportUpdatedCount: "عدد التقارير المحدث",
      cancelButton: "إلغاء",
      continueButton: "متابعة",
      verifyAndSubmitButton: "تحقق وإرسال",
      submittingText: "جاري الإرسال...",
      closeButton: "إغلاق"
    }
  };


export const tenantCheckTranslations = {
  english: {
    title: "Check Tenant Information",
    subtitle: "Search for potential tenants to see if they have a history of fraudulent activity or scams.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    searchButton: "Search",
    searchingText: "Searching...",
    clearButton: "Clear",
    resultsTitle: "Search Results",
    noResultsTitle: "No suspicious activity found",
    noResultsSubtitle: "The person you searched for does not appear in our database of suspicious leasers.",
    reportedText: "Reported",
    timesText: "times",
    emailText: "Email:",
    phoneText: "Phone:",
    addressesText: "Known addresses:",
    flagsText: "Warning flags:",
    errorText: "Please fill in at least one search field.",
    // Report modal translations
    reportButton: "Report this person",
    reportModalTitle: "Report Suspicious Leaser",
    reportingPerson: "You are reporting:",
    reportCurrentCount: "Current report count:",
    reportEvidenceNote: "Please provide evidence such as lease documents, screenshots of communication, or any other proof that supports your report.",
    reportUploadEvidence: "Upload Evidence",
    reportBrowseFiles: "Browse files",
    reportUploadedFiles: "Uploaded files",
    reportNoFilesError: "Please upload at least one document as evidence",
    reportVerifyingYourSubmission: "We are verifying your submission and analyzing the uploaded evidence.",
    reportVerifyingFiles: "Verifying uploaded files...",
    reportAnalyzingContent: "Analyzing document content...",
    reportCheckingMetadata: "Checking document metadata...",
    reportValidatingEvidence: "Validating evidence...",
    reportConfirmingIdentity: "Confirming your identity...",
    reportProcessing: "Processing...",
    reportThankYou: "Thank You!",
    reportSuccessMessage: "Report submitted successfully. Our team will review your evidence.",
    reportErrorMessage: "An error occurred while submitting your report. Please try again.",
    reportUpdatedCount: "Updated report count",
    cancelButton: "Cancel",
    continueButton: "Continue",
    verifyAndSubmitButton: "Verify & Submit",
    submittingText: "Submitting...",
    closeButton: "Close"
  },
  spanish: {
    title: "Verificar Información del Arrendador",
    subtitle: "Verifica con quién estás tratando. Busca en nuestra base de datos de arrendadores problemáticos reportados antes de firmar cualquier cosa.",
    nameLabel: "Nombre del Arrendador",
    emailLabel: "Correo Electrónico",
    phoneLabel: "Número de Teléfono",
    addressLabel: "Dirección de la Propiedad",
    searchButton: "Buscar",
    searchingText: "Buscando...",
    clearButton: "Borrar",
    noResultsTitle: "No se encontraron arrendadores sospechosos que coincidan con tus criterios.",
    noResultsSubtitle: "Esto no garantiza la seguridad. Siempre verifica las credenciales.",
    resultsTitle: "Resultados de la Búsqueda",
    emailText: "Correo:",
    phoneText: "Teléfono:",
    addressesText: "Direcciones conocidas:",
    flagsText: "Señales de alerta:",
    reportedText: "Reportado",
    timesText: "veces",
    errorText: "Por favor ingresa al menos un criterio de búsqueda",
    // Add report modal translations
    reportButton: "Reportar a esta persona",
    reportModalTitle: "Reportar Arrendador Sospechoso",
    reportingPerson: "Estás reportando a:",
    reportCurrentCount: "Número actual de reportes:",
    reportEvidenceNote: "Por favor, proporciona evidencia como documentos de arrendamiento, capturas de pantalla de comunicaciones o cualquier otra prueba que respalde tu reporte.",
    reportUploadEvidence: "Subir Evidencia",
    reportBrowseFiles: "Explorar archivos",
    reportUploadedFiles: "Archivos subidos",
    reportNoFilesError: "Por favor, sube al menos un documento como evidencia",
    reportVerifyingYourSubmission: "Estamos verificando tu envío y analizando la evidencia cargada.",
    reportVerifyingFiles: "Verificando archivos subidos...",
    reportAnalyzingContent: "Analizando contenido del documento...",
    reportCheckingMetadata: "Verificando metadatos del documento...",
    reportValidatingEvidence: "Validando evidencia...",
    reportConfirmingIdentity: "Confirmando tu identidad...",
    reportProcessing: "Procesando...",
    reportThankYou: "¡Gracias!",
    reportSuccessMessage: "Reporte enviado con éxito. Nuestro equipo revisará tu evidencia.",
    reportErrorMessage: "Ocurrió un error al enviar tu reporte. Por favor intenta de nuevo.",
    reportUpdatedCount: "Número de reportes actualizado",
    cancelButton: "Cancelar",
    continueButton: "Continuar",
    verifyAndSubmitButton: "Verificar y Enviar",
    submittingText: "Enviando...",
    closeButton: "Cerrar"
  },
  chinese: {
    title: "检查房东信息",
    subtitle: "验证您正在与谁打交道。在签署任何内容之前，请搜索我们报告的问题房东数据库。",
    nameLabel: "房东姓名",
    emailLabel: "电子邮件",
    phoneLabel: "电话号码",
    addressLabel: "房产地址",
    searchButton: "搜索",
    searchingText: "搜索中...",
    clearButton: "清除",
    noResultsTitle: "未找到符合您条件的可疑房东。",
    noResultsSubtitle: "这并不保证安全。请始终验证凭证。",
    resultsTitle: "搜索结果",
    emailText: "电子邮件：",
    phoneText: "电话：",
    addressesText: "已知地址：",
    flagsText: "警告标志：",
    reportedText: "已报告",
    timesText: "次",
    errorText: "请输入至少一个搜索条件",
    // Report modal translations
    reportButton: "报告这个人",
    reportModalTitle: "报告可疑房东",
    reportingPerson: "你正在报告：",
    reportCurrentCount: "当前报告次数：",
    reportEvidenceNote: "请提供证据，例如租赁文件、通信截图或其他支持你报告的证明。",
    reportUploadEvidence: "上传证据",
    reportBrowseFiles: "浏览文件",
    reportUploadedFiles: "已上传文件",
    reportNoFilesError: "请上传至少一个文件作为证据",
    reportVerifyingYourSubmission: "我们正在验证你的提交并分析上传的证据。",
    reportVerifyingFiles: "验证已上传文件...",
    reportAnalyzingContent: "分析文档内容...",
    reportCheckingMetadata: "检查文档元数据...",
    reportValidatingEvidence: "验证证据...",
    reportConfirmingIdentity: "确认你的身份...",
    reportProcessing: "处理中...",
    reportThankYou: "谢谢！",
    reportSuccessMessage: "报告已成功提交。我们的团队将审查你的证据。",
    reportErrorMessage: "提交报告时发生错误。请再试一次。",
    reportUpdatedCount: "更新报告次数",
    cancelButton: "取消",
    continueButton: "继续",
    verifyAndSubmitButton: "验证并提交",
    submittingText: "提交中...",
    closeButton: "关闭"
  },
  hindi: {
    title: "मकान मालिक की जानकारी जांचें",
    subtitle:
      "आप किसके साथ व्यवहार कर रहे हैं, इसकी पुष्टि करें। कुछ भी हस्ताक्षर करने से पहले हमारे डेटाबेस में रिपोर्ट किए गए समस्याग्रस्त मकान मालिकों की खोज करें।",
    nameLabel: "मकान मालिक का नाम",
    emailLabel: "ईमेल पता",
    phoneLabel: "फोन नंबर",
    addressLabel: "संपत्ति का पता",
    searchButton: "खोजें",
    searchingText: "खोज रहे हैं...",
    clearButton: "साफ़ करें",
    noResultsTitle: "आपके मानदंडों से मेल खाने वाले कोई संदिग्ध मकान मालिक नहीं मिले।",
    noResultsSubtitle: "यह सुरक्षा की गारंटी नहीं देता है। हमेशा प्रमाणपत्रों की पुष्टि करें।",
    resultsTitle: "खोज परिणाम",
    emailText: "ईमेल:",
    phoneText: "फोन:",
    addressesText: "ज्ञात पते:",
    flagsText: "चेतावनी संकेत:",
    reportedText: "रिपोर्ट किया गया",
    timesText: "बार",
    errorText: "कृपया कम से कम एक खोज मानदंड दर्ज करें",
    // Report modal translations
    reportButton: "इस व्यक्ति को रिपोर्ट करें",
    reportModalTitle: "विश्वेद्य भट्टे को रिपोर्ट करें",
    reportingPerson: "आप रिपोर्ट कर रहे हैं:",
    reportCurrentCount: "वर्तमान रिपोर्ट की संख्या:",
    reportEvidenceNote: "कृपया कोई भी उपलब्ध दस्तावेज़ या संवाद के छवियों को अपलोड करें जो आपकी रिपोर्ट को समर्थन करते हैं।",
    reportUploadEvidence: "उपलब्ध दस्तावेज़ अपलोड करें",
    reportBrowseFiles: "फाइल खोजें",
    reportUploadedFiles: "अपलोड फाइलें",
    reportNoFilesError: "कृपया कम से कम एक दस्तावेज़ अपलोड करें जो उपलब्ध दस्तावेज़ को समर्थन करता है",
    reportVerifyingYourSubmission: "हम आपके आंदोलन को सत्यापित कर रहे हैं और अपलोड दस्तावेज़ को विश्लेषण कर रहे हैं।",
    reportVerifyingFiles: "अपलोड फाइलें सत्यापित करते हैं...",
    reportAnalyzingContent: "दस्तावेज़ सामग्री विश्लेषण करते हैं...",
    reportCheckingMetadata: "दस्तावेज़ मेटाडेटा जांचते हैं...",
    reportValidatingEvidence: "उपलब्ध दस्तावेज़ सत्यापित करते हैं...",
    reportConfirmingIdentity: "आपकी पहचान सत्यापित करते हैं...",
    reportProcessing: "प्रक्रिया करते हैं...",
    reportThankYou: "धन्यवाद!",
    reportSuccessMessage: "रिपोर्ट सफलतापूर्वक जमा कर ली गई है। हमारी टीम आपके उपलब्ध दस्तावेज़ को विश्लेषण करेगी।",
    reportErrorMessage: "रिपोर्ट जमा करते समय एक त्रुटि हुई। कृपया फिर से प्रयास करें।",
    reportUpdatedCount: "अपडेट रिपोर्ट की संख्या",
    cancelButton: "रद्द करें",
    continueButton: "जारी रखें",
    verifyAndSubmitButton: "सत्यापित और जमा करें",
    submittingText: "जमा करते हैं...",
    closeButton: "बंद करें"
  },
  korean: {
    title: "집주인 정보 확인",
    subtitle: "거래하는 상대방을 확인하세요. 계약서에 서명하기 전에 문제가 보고된 집주인 데이터베이스를 검색하세요.",
    nameLabel: "집주인 이름",
    emailLabel: "이메일 주소",
    phoneLabel: "전화번호",
    addressLabel: "부동산 주소",
    searchButton: "검색",
    searchingText: "검색 중...",
    clearButton: "지우기",
    noResultsTitle: "검색 기준과 일치하는 의심스러운 집주인이 없습니다.",
    noResultsSubtitle: "이것이 안전을 보장하지는 않습니다. 항상 자격 증명을 확인하세요.",
    resultsTitle: "검색 결과",
    emailText: "이메일:",
    phoneText: "전화:",
    addressesText: "알려진 주소:",
    flagsText: "경고 신호:",
    reportedText: "신고됨",
    timesText: "회",
    errorText: "하나 이상의 검색 기준을 입력하세요",
    // Report modal translations
    reportButton: "이 사람을 신고",
    reportModalTitle: "의심스러운 집주인 신고",
    reportingPerson: "당신이 신고하는 사람:",
    reportCurrentCount: "현재 신고 횟수:",
    reportEvidenceNote: "신고를 지원하는 모든 문서 또는 통신 스크린샷 또는 다른 증거를 업로드하세요.",
    reportUploadEvidence: "증거 업로드",
    reportBrowseFiles: "파일 찾기",
    reportUploadedFiles: "업로드된 파일",
    reportNoFilesError: "최소한 하나의 문서를 업로드하세요",
    reportVerifyingYourSubmission: "우리는 당신의 제출을 확인하고 업로드된 증거를 분석하고 있습니다.",
    reportVerifyingFiles: "업로드된 파일 확인...",
    reportAnalyzingContent: "문서 내용 분석...",
    reportCheckingMetadata: "문서 메타데이터 확인...",
    reportValidatingEvidence: "증거 확인...",
    reportConfirmingIdentity: "신분 확인...",
    reportProcessing: "처리중...",
    reportThankYou: "감사합니다!",
    reportSuccessMessage: "보고서가 성공적으로 제출되었습니다. 우리 팀이 업로드된 증거를 검토할 것입니다.",
    reportErrorMessage: "보고서 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
    reportUpdatedCount: "업데이트된 보고 횟수",
    cancelButton: "취소",
    continueButton: "계속",
    verifyAndSubmitButton: "확인 및 제출",
    submittingText: "제출중...",
    closeButton: "닫기"
  },
  bengali: {
    title: "বাড়িওয়ালার তথ্য যাচাই করুন",
    subtitle: "আপনি কার সাথে লেনদেন করছেন তা যাচাই করুন। কোনও কিছুতে স্বাক্ষর করার আগে আমাদের ডাটাবেসে রিপোর্ট করা সমস্যাযুক্ত বাড়িওয়ালাদের অনুসন্ধান করুন।",
    nameLabel: "বাড়িওয়ালার নাম",
    emailLabel: "ইমেল ঠিকানা",
    phoneLabel: "ফোন নম্বর",
    addressLabel: "সম্পত্তির ঠিকানা",
    searchButton: "অনুসন্ধান করুন",
    searchingText: "অনুসন্ধান করছে...",
    clearButton: "পরিষ্কার করুন",
    noResultsTitle: "আপনার মানদণ্ড মেলে এমন কোনও সন্দেহজনক বাড়িওয়ালা পাওয়া যায়নি।",
    noResultsSubtitle: "এটি নিরাপত্তার গ্যারান্টি দেয় না। সর্বদা শংসাপত্র যাচাই করুন।",
    resultsTitle: "অনুসন্ধানের ফলাফল",
    emailText: "ইমেল:",
    phoneText: "ফোন:",
    addressesText: "পরিচিত ঠিকানা:",
    flagsText: "সতর্কতা সংকেত:",
    reportedText: "রিপোর্ট করা হয়েছে",
    timesText: "বার",
    errorText: "অনুগ্রহ করে কমপক্ষে একটি অনুসন্ধান মানদণ্ড লিখুন",
    // Report modal translations
    reportButton: "এই ব্যক্তিকে রিপোর্ট করুন",
    reportModalTitle: "বিশ্বাসযোগ্য ভট্টালা রিপোর্ট করুন",
    reportingPerson: "আপনি রিপোর্ট করছেন:",
    reportCurrentCount: "বর্তমান রিপোর্ট সংখ্যা:",
    reportEvidenceNote: "কোনও দস্তাবেজ বা সংযোগের ছবি অপলোড করুন যা আপনার রিপোর্টকে সমর্থন করে।",
    reportUploadEvidence: "উপলব্ধ দস্তাবেজ অপলোড করুন",
    reportBrowseFiles: "ফাইল অনুসন্ধান করুন",
    reportUploadedFiles: "অপলোড ফাইল",
    reportNoFilesError: "কমপক্ষে একটি দস্তাবেজ অপলোড করুন যা উপলব্ধ দস্তাবেজ সমর্থন করে",
    reportVerifyingYourSubmission: "আমরা আপনার প্রস্তাবন সত্যাপন করছি এবং অপলোড দস্তাবেজ বিশ্লেষণ করছি।",
    reportVerifyingFiles: "অপলোড ফাইল সত্যাপন...",
    reportAnalyzingContent: "দস্তাবেজ সামগ্রী বিশ্লেষণ...",
    reportCheckingMetadata: "দস্তাবেজ মেটাডাটা সত্যাপন...",
    reportValidatingEvidence: "উপলব্ধ দস্তাবেজ সত্যাপন...",
    reportConfirmingIdentity: "আপনার পরিচয় সত্যাপন...",
    reportProcessing: "প্রক্রিয়া করছি...",
    reportThankYou: "ধন্যবাদ!",
    reportSuccessMessage: "রিপোর্ট সফলভাবে জমা করা হয়েছে। আমাদের টিম আপনার উপলব্ধ দস্তাবেজ বিশ্লেষণ করবে।",
    reportErrorMessage: "রিপোর্ট জমা করার সময় একটি ত্রুটি ঘটেছে। কমপক্ষে আবার চেষ্টা করুন।",
    reportUpdatedCount: "আপডেট রিপোর্ট সংখ্যা",
    cancelButton: "বাতিল করুন",
    continueButton: "চলতে থাকুন",
    verifyAndSubmitButton: "যাচাই এবং জমা দিন",
    submittingText: "জমা করতে হালিয়ে আছে...",
    closeButton: "বন্ধ করুন"
  },
  swahili: {
    title: "Angalia Maelezo ya Mmiliki",
    subtitle: "Thibitisha ni nani unayeshughulika naye. Tafuta katika hifadhidata yetu ya wamiliki wenye matatizo walioripotiwa kabla ya kutia saini chochote.",
    nameLabel: "Jina la Mmiliki",
    emailLabel: "Anwani ya Barua pepe",
    phoneLabel: "Nambari ya Simu",
    addressLabel: "Anwani ya Mali",
    searchButton: "Tafuta",
    searchingText: "Inatafuta...",
    clearButton: "Futa",
    noResultsTitle: "Hakuna wamiliki wa mashaka waliopatikana kulingana na vigezo vyako.",
    noResultsSubtitle: "Hii haidhaminishi usalama. Daima thibitisha hati.",
    resultsTitle: "Matokeo ya Utafutaji",
    emailText: "Barua pepe:",
    phoneText: "Simu:",
    addressesText: "Anwani zinazojulikana:",
    flagsText: "Alama za tahadhari:",
    reportedText: "Imeripotiwa",
    timesText: "mara",
    errorText: "Tafadhali ingiza angalau kigezo kimoja cha utafutaji",
    // Report modal translations
    reportButton: "Ripoti mtu huyu",
    reportModalTitle: "Ripoti Mpangishaji Anayeshukiwa",
    reportingPerson: "Unaripoti:",
    reportCurrentCount: "Idadi ya ripoti za sasa:",
    reportEvidenceNote: "Tafadhali toa ushahidi kama vile hati za kukodisha, picha za mawasiliano, au ushahidi mwingine wowote unaoiunga mkono ripoti yako.",
    reportUploadEvidence: "Pakia Ushahidi",
    reportBrowseFiles: "Vinjari faili",
    reportUploadedFiles: "Faili zilizopakiwa",
    reportNoFilesError: "Tafadhali pakia hati angalau moja kama ushahidi",
    reportVerifyingYourSubmission: "Tunathibitisha uwasilishaji wako na kuchambua ushahidi uliopakiwa.",
    reportVerifyingFiles: "Kuthibitisha faili zilizopakiwa...",
    reportAnalyzingContent: "Kuchambua maudhui ya hati...",
    reportCheckingMetadata: "Kuangalia metadata ya hati...",
    reportValidatingEvidence: "Kuthibitisha ushahidi...",
    reportConfirmingIdentity: "Kuthibitisha utambulisho wako...",
    reportProcessing: "Inachakata...",
    reportThankYou: "Asante!",
    reportSuccessMessage: "Ripoti imewasilishwa kwa mafanikio. Timu yetu itaangalia ushahidi wako.",
    reportErrorMessage: "Hitilafu imetokea wakati wa kuwasilisha ripoti yako. Tafadhali jaribu tena.",
    reportUpdatedCount: "Idadi ya ripoti iliyosasishwa",
    cancelButton: "Ghairi",
    continueButton: "Endelea",
    verifyAndSubmitButton: "Thibitisha na Wasilisha",
    submittingText: "Inawasilisha...",
    closeButton: "Funga"
  },
  arabic: {
    title: "التحقق من معلومات المؤجر",
    subtitle: "تحقق ممن تتعامل معه. ابحث في قاعدة بياناتنا عن المؤجرين المشكلين الذين تم الإبلاغ عنهم قبل التوقيع على أي شيء.",
    nameLabel: "اسم المؤجر",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "رقم الهاتف",
    addressLabel: "عنوان العقار",
    searchButton: "بحث",
    searchingText: "جارٍ البحث...",
    clearButton: "مسح",
    noResultsTitle: "لم يتم العثور على مؤجرين مشبوهين مطابقين لمعاييرك.",
    noResultsSubtitle: "هذا لا يضمن السلامة. تحقق دائمًا من بيانات الاعتماد.",
    resultsTitle: "نتائج البحث",
    emailText: "البريد الإلكتروني:",
    phoneText: "الهاتف:",
    addressesText: "العناوين المعروفة:",
    flagsText: "علامات التحذير:",
    reportedText: "تم الإبلاغ",
    timesText: "مرات",
    errorText: "الرجاء إدخال معيار بحث واحد على الأقل",
    // Report modal translations
    reportButton: "الإبلاغ عن هذا الشخص",
    reportModalTitle: "الإبلاغ عن مؤجر مشبوه",
    reportingPerson: "أنت تبلغ عن:",
    reportCurrentCount: "عدد التقارير الحالية:",
    reportEvidenceNote: "يرجى تقديم أدلة مثل مستندات الإيجار أو لقطات الشاشة للمراسلات أو أي دليل آخر يدعم تقريرك.",
    reportUploadEvidence: "تحميل الأدلة",
    reportBrowseFiles: "تصفح الملفات",
    reportUploadedFiles: "الملفات المحملة",
    reportNoFilesError: "يرجى تحميل مستند واحد على الأقل كدليل",
    reportVerifyingYourSubmission: "نحن نتحقق من طلبك ونحلل الأدلة المحملة.",
    reportVerifyingFiles: "التحقق من الملفات المحملة...",
    reportAnalyzingContent: "تحليل محتوى المستند...",
    reportCheckingMetadata: "فحص البيانات الوصفية للمستند...",
    reportValidatingEvidence: "التحقق من الأدلة...",
    reportConfirmingIdentity: "تأكيد هويتك...",
    reportProcessing: "جاري المعالجة...",
    reportThankYou: "شكراً لك!",
    reportSuccessMessage: "تم تقديم التقرير بنجاح. سيقوم فريقنا بمراجعة الأدلة الخاصة بك.",
    reportErrorMessage: "حدث خطأ أثناء تقديم تقريرك. يرجى المحاولة مرة أخرى.",
    reportUpdatedCount: "عدد التقارير المحدث",
    cancelButton: "إلغاء",
    continueButton: "متابعة",
    verifyAndSubmitButton: "تحقق وإرسال",
    submittingText: "جاري الإرسال...",
    closeButton: "إغلاق"
  }
};

export const lawyers = {
  "english": [
    {
      "name": "Mary Shah",
      "languages": [
        "english",
        "chinese"
      ],
      "specialization": "Housing Law",
      "location": "Albuquerque, NM",
      "region": "West",
      "phone": "(553) 968-8447",
      "email": "lawyer2@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/27.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.4
    },
    {
      "name": "Karen Martin",
      "languages": [
        "english",
        "spanish"
      ],
      "specialization": "Lease Agreements",
      "location": "Seattle, WA",
      "region": "Pacific",
      "phone": "(924) 844-7696",
      "email": "lawyer3@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/99.jpg",
      "freeDuration": "1 hour",
      "rating": 3.3
    },
    {
      "name": "James López",
      "languages": [
        "english",
        "chinese"
      ],
      "specialization": "Housing Law",
      "location": "Portland, OR",
      "region": "Pacific",
      "phone": "(575) 341-2797",
      "email": "lawyer10@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/62.jpg",
      "freeDuration": "1 hour",
      "rating": 4.8
    },
    {
      "name": "Rahul Anderson",
      "languages": [
        "english",
        "chinese",
        "spanish"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Las Vegas, NV",
      "region": "West",
      "phone": "(880) 547-5366",
      "email": "lawyer18@example.com",
      "website": "https://lawyer18.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/65.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.6
    }
  ],
  "chinese": [
    {
      "name": "Mary Shah",
      "languages": [
        "english",
        "chinese"
      ],
      "specialization": "Housing Law",
      "location": "Albuquerque, NM",
      "region": "West",
      "phone": "(553) 968-8447",
      "email": "lawyer2@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/27.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.4
    },
    {
      "name": "Joseph Jones",
      "languages": [
        "chinese",
        "hindi",
        "swahili"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Orlando, FL",
      "region": "South",
      "phone": "(308) 782-7787",
      "email": "lawyer6@example.com",
      "website": "https://lawyer6.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/88.jpg",
      "freeDuration": "15 minutes",
      "rating": 4.2
    },
    {
      "name": "Ji-hoon Miller",
      "languages": [
        "spanish",
        "chinese"
      ],
      "specialization": "Real Estate Law",
      "location": "Dallas, TX",
      "region": "South",
      "phone": "(271) 917-7119",
      "email": "lawyer7@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/77.jpg",
      "freeDuration": "30 minutes",
      "rating": 3.3
    },
    {
      "name": "James López",
      "languages": [
        "english",
        "chinese"
      ],
      "specialization": "Housing Law",
      "location": "Portland, OR",
      "region": "Pacific",
      "phone": "(575) 341-2797",
      "email": "lawyer10@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/62.jpg",
      "freeDuration": "1 hour",
      "rating": 4.8
    },
    {
      "name": "Jennifer Park",
      "languages": [
        "arabic",
        "chinese"
      ],
      "specialization": "Real Estate Law",
      "location": "Sacramento, CA",
      "region": "Pacific",
      "phone": "(581) 178-3788",
      "email": "lawyer12@example.com",
      "website": "https://lawyer12.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/57.jpg",
      "freeDuration": "1 hour",
      "rating": 3.2
    },
    {
      "name": "Mary Das",
      "languages": [
        "korean",
        "chinese",
        "bengali"
      ],
      "specialization": "Lease Agreements",
      "location": "Philadelphia, PA",
      "region": "Northeast",
      "phone": "(529) 571-3759",
      "email": "lawyer16@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/84.jpg",
      "freeDuration": "30 minutes",
      "rating": 5.0
    },
    {
      "name": "Rahul Anderson",
      "languages": [
        "english",
        "chinese",
        "spanish"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Las Vegas, NV",
      "region": "West",
      "phone": "(880) 547-5366",
      "email": "lawyer18@example.com",
      "website": "https://lawyer18.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/65.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.6
    }
  ],
  "hindi": [
    {
      "name": "Jennifer Miller",
      "languages": [
        "hindi"
      ],
      "specialization": "Housing Contracts",
      "location": "Denver, CO",
      "region": "West",
      "phone": "(694) 848-4349",
      "email": "lawyer1@example.com",
      "website": "https://lawyer1.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/64.jpg",
      "freeDuration": "1 hour",
      "rating": 3.1
    },
    {
      "name": "Fatima Park",
      "languages": [
        "arabic",
        "hindi"
      ],
      "specialization": "Housing Law",
      "location": "Portland, OR",
      "region": "Pacific",
      "phone": "(624) 519-5938",
      "email": "lawyer5@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/20.jpg",
      "freeDuration": null,
      "rating": 4.8
    },
    {
      "name": "Joseph Jones",
      "languages": [
        "chinese",
        "hindi",
        "swahili"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Orlando, FL",
      "region": "South",
      "phone": "(308) 782-7787",
      "email": "lawyer6@example.com",
      "website": "https://lawyer6.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/88.jpg",
      "freeDuration": "15 minutes",
      "rating": 4.2
    },
    {
      "name": "Priya Smith",
      "languages": [
        "arabic",
        "hindi"
      ],
      "specialization": "Landlord-Tenant Disputes",
      "location": "Miami, FL",
      "region": "South",
      "phone": "(824) 325-3268",
      "email": "lawyer8@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/48.jpg",
      "freeDuration": "15 minutes",
      "rating": 3.3
    }
  ],
  "spanish": [
    {
      "name": "Karen Martin",
      "languages": [
        "english",
        "spanish"
      ],
      "specialization": "Lease Agreements",
      "location": "Seattle, WA",
      "region": "Pacific",
      "phone": "(924) 844-7696",
      "email": "lawyer3@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/99.jpg",
      "freeDuration": "1 hour",
      "rating": 3.3
    },
    {
      "name": "Ji-hoon Miller",
      "languages": [
        "spanish",
        "chinese"
      ],
      "specialization": "Real Estate Law",
      "location": "Dallas, TX",
      "region": "South",
      "phone": "(271) 917-7119",
      "email": "lawyer7@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/77.jpg",
      "freeDuration": "30 minutes",
      "rating": 3.3
    },
    {
      "name": "Linda Patel",
      "languages": [
        "spanish"
      ],
      "specialization": "Housing Discrimination",
      "location": "Seattle, WA",
      "region": "Pacific",
      "phone": "(582) 302-3069",
      "email": "lawyer9@example.com",
      "website": "https://lawyer9.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/24.jpg",
      "freeDuration": "15 minutes",
      "rating": 3.5
    },
    {
      "name": "Rahul Anderson",
      "languages": [
        "english",
        "chinese",
        "spanish"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Las Vegas, NV",
      "region": "West",
      "phone": "(880) 547-5366",
      "email": "lawyer18@example.com",
      "website": "https://lawyer18.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/65.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.6
    },
    {
      "name": "Maria Garcia",
      "languages": [
        "bengali",
        "spanish"
      ],
      "specialization": "Eviction Defense",
      "location": "Nashville, TN",
      "region": "South",
      "phone": "(139) 613-8454",
      "email": "lawyer20@example.com",
      "website": "https://lawyer20.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/81.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.5
    }
  ],
  "korean": [
    {
      "name": "Juan Chen",
      "languages": [
        "korean",
        "bengali"
      ],
      "specialization": "Landlord-Tenant Disputes",
      "location": "Pittsburgh, PA",
      "region": "Northeast",
      "phone": "(709) 154-2102",
      "email": "lawyer11@example.com",
      "website": "https://lawyer11.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/25.jpg",
      "freeDuration": null,
      "rating": 3.9
    },
    {
      "name": "Ahmed Williams",
      "languages": [
        "bengali",
        "korean"
      ],
      "specialization": "Housing Contracts",
      "location": "Columbus, OH",
      "region": "Midwest",
      "phone": "(374) 672-6131",
      "email": "lawyer14@example.com",
      "website": "https://lawyer14.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/37.jpg",
      "freeDuration": "1 hour",
      "rating": 3.1
    },
    {
      "name": "Mary Das",
      "languages": [
        "korean",
        "chinese",
        "bengali"
      ],
      "specialization": "Lease Agreements",
      "location": "Philadelphia, PA",
      "region": "Northeast",
      "phone": "(529) 571-3759",
      "email": "lawyer16@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/84.jpg",
      "freeDuration": "30 minutes",
      "rating": 5.0
    }
  ],
  "bengali": [
    {
      "name": "Juan Chen",
      "languages": [
        "korean",
        "bengali"
      ],
      "specialization": "Landlord-Tenant Disputes",
      "location": "Pittsburgh, PA",
      "region": "Northeast",
      "phone": "(709) 154-2102",
      "email": "lawyer11@example.com",
      "website": "https://lawyer11.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/25.jpg",
      "freeDuration": null,
      "rating": 3.9
    },
    {
      "name": "Ahmed Williams",
      "languages": [
        "bengali",
        "korean"
      ],
      "specialization": "Housing Contracts",
      "location": "Columbus, OH",
      "region": "Midwest",
      "phone": "(374) 672-6131",
      "email": "lawyer14@example.com",
      "website": "https://lawyer14.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/37.jpg",
      "freeDuration": "1 hour",
      "rating": 3.1
    },
    {
      "name": "Mary Das",
      "languages": [
        "korean",
        "chinese",
        "bengali"
      ],
      "specialization": "Lease Agreements",
      "location": "Philadelphia, PA",
      "region": "Northeast",
      "phone": "(529) 571-3759",
      "email": "lawyer16@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/84.jpg",
      "freeDuration": "30 minutes",
      "rating": 5.0
    },
    {
      "name": "Nancy Jones",
      "languages": [
        "arabic",
        "bengali"
      ],
      "specialization": "Real Estate Law",
      "location": "St. Louis, MO",
      "region": "Midwest",
      "phone": "(419) 994-2844",
      "email": "lawyer19@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/14.jpg",
      "freeDuration": "30 minutes",
      "rating": 3.8
    },
    {
      "name": "Maria Garcia",
      "languages": [
        "bengali",
        "spanish"
      ],
      "specialization": "Eviction Defense",
      "location": "Nashville, TN",
      "region": "South",
      "phone": "(139) 613-8454",
      "email": "lawyer20@example.com",
      "website": "https://lawyer20.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/81.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.5
    }
  ],
  "swahili": [
    {
      "name": "Juan Singh",
      "languages": [
        "arabic",
        "swahili"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Boston, MA",
      "region": "Northeast",
      "phone": "(973) 322-2126",
      "email": "lawyer4@example.com",
      "website": "https://lawyer4.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/8.jpg",
      "freeDuration": "1 hour",
      "rating": 4.6
    },
    {
      "name": "Joseph Jones",
      "languages": [
        "chinese",
        "hindi",
        "swahili"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Orlando, FL",
      "region": "South",
      "phone": "(308) 782-7787",
      "email": "lawyer6@example.com",
      "website": "https://lawyer6.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/88.jpg",
      "freeDuration": "15 minutes",
      "rating": 4.2
    },
    {
      "name": "Ji-hoon Anderson",
      "languages": [
        "swahili"
      ],
      "specialization": "Housing Contracts",
      "location": "Houston, TX",
      "region": "South",
      "phone": "(855) 628-2026",
      "email": "lawyer13@example.com",
      "website": "https://lawyer13.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/72.jpg",
      "freeDuration": null,
      "rating": 5.0
    }
  ],
  "arabic": [
    {
      "name": "Juan Singh",
      "languages": [
        "arabic",
        "swahili"
      ],
      "specialization": "Security Deposit Disputes",
      "location": "Boston, MA",
      "region": "Northeast",
      "phone": "(973) 322-2126",
      "email": "lawyer4@example.com",
      "website": "https://lawyer4.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/8.jpg",
      "freeDuration": "1 hour",
      "rating": 4.6
    },
    {
      "name": "Fatima Park",
      "languages": [
        "arabic",
        "hindi"
      ],
      "specialization": "Housing Law",
      "location": "Portland, OR",
      "region": "Pacific",
      "phone": "(624) 519-5938",
      "email": "lawyer5@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/20.jpg",
      "freeDuration": null,
      "rating": 4.8
    },
    {
      "name": "Priya Smith",
      "languages": [
        "arabic",
        "hindi"
      ],
      "specialization": "Landlord-Tenant Disputes",
      "location": "Miami, FL",
      "region": "South",
      "phone": "(824) 325-3268",
      "email": "lawyer8@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/48.jpg",
      "freeDuration": "15 minutes",
      "rating": 3.3
    },
    {
      "name": "Jennifer Park",
      "languages": [
        "arabic",
        "chinese"
      ],
      "specialization": "Real Estate Law",
      "location": "Sacramento, CA",
      "region": "Pacific",
      "phone": "(581) 178-3788",
      "email": "lawyer12@example.com",
      "website": "https://lawyer12.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/women/57.jpg",
      "freeDuration": "1 hour",
      "rating": 3.2
    },
    {
      "name": "Linda Martin",
      "languages": [
        "arabic"
      ],
      "specialization": "Lease Agreements",
      "location": "Indianapolis, IN",
      "region": "Midwest",
      "phone": "(219) 329-2091",
      "email": "lawyer15@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/women/82.jpg",
      "freeDuration": "1 hour",
      "rating": 4.3
    },
    {
      "name": "Fatima Rodriguez",
      "languages": [
        "arabic"
      ],
      "specialization": "Housing Contracts",
      "location": "Chicago, IL",
      "region": "Midwest",
      "phone": "(611) 489-6923",
      "email": "lawyer17@example.com",
      "website": "https://lawyer17.example.com",
      "pictureUrl": "https://randomuser.me/api/portraits/men/99.jpg",
      "freeDuration": "30 minutes",
      "rating": 4.1
    },
    {
      "name": "Nancy Jones",
      "languages": [
        "arabic",
        "bengali"
      ],
      "specialization": "Real Estate Law",
      "location": "St. Louis, MO",
      "region": "Midwest",
      "phone": "(419) 994-2844",
      "email": "lawyer19@example.com",
      "website": null,
      "pictureUrl": "https://randomuser.me/api/portraits/men/14.jpg",
      "freeDuration": "30 minutes",
      "rating": 3.8
    }
  ]
}