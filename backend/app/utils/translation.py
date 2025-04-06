"""
Translation utility for Rent-Spiracy API.
This provides simple translation functions without needing AI or external APIs.
"""

from typing import Dict, List, Optional
import json

# Flag translation dictionaries for common terms
FLAG_TRANSLATIONS = {
    "english": {
        "multiple reported scams": "multiple reported scams",
        "non-existent properties": "non-existent properties",
        "asks for wire transfers": "asks for wire transfers",
        "requests payment before showing property": "requests payment before showing property",
        "unavailable for in-person meetings": "unavailable for in-person meetings",
        "uses fake property listings": "uses fake property listings",
        "requests security deposit via gift cards": "requests security deposit via gift cards",
        "offers lease without credit check": "offers lease without credit check",
        "refuses to provide property address": "refuses to provide property address",
        # New flags translations
        "excessive application fees": "excessive application fees",
        "requires payment in cryptocurrency": "requires payment in cryptocurrency",
        "claims to be out of the country": "claims to be out of the country",
        "photos don't match property": "photos don't match property",
        "price below market value": "price below market value",
        "no background check required": "no background check required",
        "refuses property tour": "refuses property tour",
        "high-pressure sales tactics": "high-pressure sales tactics",
        "no lease agreement provided": "no lease agreement provided",
        "requests bank account information": "requests bank account information"
    },
    "spanish": {
        "multiple reported scams": "múltiples estafas reportadas",
        "non-existent properties": "propiedades inexistentes",
        "asks for wire transfers": "solicita transferencias bancarias",
        "requests payment before showing property": "solicita pago antes de mostrar la propiedad",
        "unavailable for in-person meetings": "no disponible para reuniones en persona",
        "uses fake property listings": "usa listados de propiedades falsos",
        "requests security deposit via gift cards": "solicita depósito de seguridad mediante tarjetas de regalo",
        "offers lease without credit check": "ofrece contrato sin verificación de crédito",
        "refuses to provide property address": "se niega a proporcionar la dirección de la propiedad",
        # New flags translations
        "excessive application fees": "tarifas de solicitud excesivas",
        "requires payment in cryptocurrency": "requiere pago en criptomoneda",
        "claims to be out of the country": "afirma estar fuera del país",
        "photos don't match property": "las fotos no coinciden con la propiedad",
        "price below market value": "precio por debajo del valor de mercado",
        "no background check required": "no requiere verificación de antecedentes",
        "refuses property tour": "se niega a mostrar la propiedad",
        "high-pressure sales tactics": "tácticas de venta de alta presión",
        "no lease agreement provided": "no proporciona contrato de arrendamiento",
        "requests bank account information": "solicita información de cuenta bancaria"
    },
    "chinese": {
        "multiple reported scams": "多次被举报的骗局",
        "non-existent properties": "不存在的房产",
        "asks for wire transfers": "要求电汇转账",
        "requests payment before showing property": "在展示房产前要求付款",
        "unavailable for in-person meetings": "不提供面对面会议",
        "uses fake property listings": "使用虚假房产清单",
        "requests security deposit via gift cards": "通过礼品卡要求支付押金",
        "offers lease without credit check": "提供无信用检查的租约",
        "refuses to provide property address": "拒绝提供房产地址",
        # New flags translations
        "excessive application fees": "过高的申请费用",
        "requires payment in cryptocurrency": "要求使用加密货币支付",
        "claims to be out of the country": "声称人在国外",
        "photos don't match property": "照片与房产不符",
        "price below market value": "价格低于市场价值",
        "no background check required": "不要求背景调查",
        "refuses property tour": "拒绝房产参观",
        "high-pressure sales tactics": "高压销售策略",
        "no lease agreement provided": "不提供租赁协议",
        "requests bank account information": "要求银行账户信息"
    },
    "hindi": {
        "multiple reported scams": "कई रिपोर्ट किए गए घोटाले",
        "non-existent properties": "अनुपस्थित संपत्तियां",
        "asks for wire transfers": "वायर ट्रांसफर के लिए पूछता है",
        "requests payment before showing property": "संपत्ति दिखाने से पहले भुगतान का अनुरोध करता है",
        "unavailable for in-person meetings": "व्यक्तिगत बैठकों के लिए अनुपलब्ध",
        "uses fake property listings": "नकली संपत्ति लिस्टिंग का उपयोग करता है",
        "requests security deposit via gift cards": "गिफ्ट कार्ड के माध्यम से सुरक्षा जमा का अनुरोध करता है",
        "offers lease without credit check": "क्रेडिट चेक के बिना लीज की पेशकश करता है",
        "refuses to provide property address": "संपत्ति का पता प्रदान करने से इनकार करता है",
        # New flags translations
        "excessive application fees": "अत्यधिक आवेदन शुल्क",
        "requires payment in cryptocurrency": "क्रिप्टोकरेंसी में भुगतान की आवश्यकता है",
        "claims to be out of the country": "देश से बाहर होने का दावा करता है",
        "photos don't match property": "तस्वीरें संपत्ति से मेल नहीं खाती हैं",
        "price below market value": "बाजार मूल्य से कम कीमत",
        "no background check required": "पृष्ठभूमि जांच की आवश्यकता नहीं है",
        "refuses property tour": "संपत्ति भ्रमण से इनकार करता है",
        "high-pressure sales tactics": "उच्च दबाव वाली बिक्री रणनीतियाँ",
        "no lease agreement provided": "कोई लीज समझौता प्रदान नहीं किया गया",
        "requests bank account information": "बैंक खाता जानकारी का अनुरोध करता है"
    },
    "korean": {
        "multiple reported scams": "여러 번 신고된 사기",
        "non-existent properties": "존재하지 않는 부동산",
        "asks for wire transfers": "계좌 이체 요청",
        "requests payment before showing property": "부동산 보여주기 전 결제 요청",
        "unavailable for in-person meetings": "대면 미팅 불가능",
        "uses fake property listings": "가짜 부동산 목록 사용",
        "requests security deposit via gift cards": "기프트 카드로 보증금 요청",
        "offers lease without credit check": "신용 확인 없이 임대차 계약 제공",
        "refuses to provide property address": "부동산 주소 제공 거부",
        # New flags translations
        "excessive application fees": "과도한 신청 수수료",
        "requires payment in cryptocurrency": "암호화폐로 지불 요구",
        "claims to be out of the country": "해외에 있다고 주장",
        "photos don't match property": "사진이 실제 부동산과 일치하지 않음",
        "price below market value": "시장 가치 이하의 가격",
        "no background check required": "신원 조회 불필요",
        "refuses property tour": "부동산 투어 거부",
        "high-pressure sales tactics": "고압적인 판매 전략",
        "no lease agreement provided": "임대 계약서 미제공",
        "requests bank account information": "은행 계좌 정보 요청"
    },
    "bengali": {
        "multiple reported scams": "একাধিক রিপোর্ট করা প্রতারণা",
        "non-existent properties": "অবিদ্যমান সম্পত্তি",
        "asks for wire transfers": "ওয়্যার ট্রান্সফারের জন্য জিজ্ঞাসা করে",
        "requests payment before showing property": "সম্পত্তি দেখানোর আগে পেমেন্ট অনুরোধ করে",
        "unavailable for in-person meetings": "সশরীরে সাক্ষাৎ করার জন্য অনুপলব্ধ",
        "uses fake property listings": "নকল সম্পত্তি তালিকা ব্যবহার করে",
        "requests security deposit via gift cards": "গিফট কার্ডের মাধ্যমে সিকিউরিটি ডিপোজিট অনুরোধ করে",
        "offers lease without credit check": "ক্রেডিট চেক ছাড়া লিজ অফার করে",
        "refuses to provide property address": "সম্পত্তির ঠিকানা প্রদান করতে অস্বীকার করে",
        # New flags translations
        "excessive application fees": "অত্যধিক আবেদন ফি",
        "requires payment in cryptocurrency": "ক্রিপ্টোকারেন্সিতে পেমেন্ট প্রয়োজন",
        "claims to be out of the country": "দেশের বাইরে থাকার দাবি করে",
        "photos don't match property": "ছবিগুলি সম্পত্তির সাথে মেলে না",
        "price below market value": "বাজার মূল্যের চেয়ে কম দাম",
        "no background check required": "ব্যাকগ্রাউন্ড চেক প্রয়োজন নেই",
        "refuses property tour": "সম্পত্তি ভ্রমণ করতে অস্বীকার করে",
        "high-pressure sales tactics": "উচ্চ চাপের বিক্রয় কৌশল",
        "no lease agreement provided": "কোন লিজ চুক্তি প্রদান করা হয়নি",
        "requests bank account information": "ব্যাংক অ্যাকাউন্ট তথ্য অনুরোধ করে"
    },
    "swahili": {
        "multiple reported scams": "ulaghai mbalimbali ulioripotiwa",
        "non-existent properties": "mali zisizokuwepo",
        "asks for wire transfers": "huomba uhamishaji wa fedha",
        "requests payment before showing property": "huomba malipo kabla ya kuonyesha mali",
        "unavailable for in-person meetings": "hapatikani kwa mikutano ya ana kwa ana",
        "uses fake property listings": "hutumia orodha za mali bandia",
        "requests security deposit via gift cards": "huomba amana ya usalama kupitia kadi za zawadi",
        "offers lease without credit check": "hutoa kukodisha bila ukaguzi wa mikopo",
        "refuses to provide property address": "hukataa kutoa anwani ya mali",
        # New flags translations
        "excessive application fees": "ada za maombi kubwa kupita kiasi",
        "requires payment in cryptocurrency": "inahitaji malipo katika sarafu ya crypto",
        "claims to be out of the country": "anadai kuwa nje ya nchi",
        "photos don't match property": "picha hazilingani na mali",
        "price below market value": "bei chini ya thamani ya soko",
        "no background check required": "hakuna ukaguzi wa historia unaohitajika",
        "refuses property tour": "anakataa kuonyesha mali",
        "high-pressure sales tactics": "mbinu za shinikizo la juu za uuzaji",
        "no lease agreement provided": "hakuna mkataba wa kukodisha uliotolewa",
        "requests bank account information": "anaomba maelezo ya akaunti ya benki"
    },
    "arabic": {
        "multiple reported scams": "عمليات احتيال متعددة تم الإبلاغ عنها",
        "non-existent properties": "عقارات غير موجودة",
        "asks for wire transfers": "يطلب تحويلات مصرفية",
        "requests payment before showing property": "يطلب الدفع قبل عرض العقار",
        "unavailable for in-person meetings": "غير متاح للاجتماعات الشخصية",
        "uses fake property listings": "يستخدم قوائم عقارات مزيفة",
        "requests security deposit via gift cards": "يطلب وديعة تأمين عبر بطاقات الهدايا",
        "offers lease without credit check": "يقدم عقد إيجار بدون فحص ائتماني",
        "refuses to provide property address": "يرفض تقديم عنوان العقار",
        # New flags translations
        "excessive application fees": "رسوم طلب مفرطة",
        "requires payment in cryptocurrency": "يتطلب الدفع بالعملات المشفرة",
        "claims to be out of the country": "يدعي أنه خارج البلاد",
        "photos don't match property": "الصور لا تتطابق مع العقار",
        "price below market value": "السعر أقل من قيمة السوق",
        "no background check required": "لا يتطلب التحقق من الخلفية",
        "refuses property tour": "يرفض جولة العقار",
        "high-pressure sales tactics": "تكتيكات بيع عالية الضغط",
        "no lease agreement provided": "لا يوفر اتفاقية إيجار",
        "requests bank account information": "يطلب معلومات الحساب المصرفي"
    },
}

def translate_flag(flag: str, language: str = "english") -> str:
    """
    Translate a flag to the target language based on pattern matching.
    
    Args:
        flag: The flag text to translate
        language: Target language code
        
    Returns:
        Translated flag text
    """
    # Default to English if language not supported
    if language not in FLAG_TRANSLATIONS:
        language = "english"
        
    # Get translation dictionary for the language
    translations = FLAG_TRANSLATIONS[language]
    
    # Look for matches in the dictionary
    for pattern, translation in translations.items():
        if pattern.lower() in flag.lower():
            return translation
            
    # Return original if no match found
    return flag
    
def translate_suspect_leaser(leaser: Dict, language: str = "english") -> Dict:
    """
    Translate flags in a suspect leaser document.
    
    Args:
        leaser: The suspect leaser document
        language: Target language code
        
    Returns:
        Leaser document with translated flags
    """
    # Don't modify the original
    translated = dict(leaser)
    
    # Translate flags if present
    if "flags" in translated and isinstance(translated["flags"], list):
        translated["flags"] = [translate_flag(flag, language) for flag in translated["flags"]]
        
    return translated 