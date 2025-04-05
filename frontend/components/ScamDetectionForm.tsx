"use client";

import { useState, FormEvent, ChangeEvent } from "react";

interface ScamDetectionFormProps {
  language: string;
  onSubmit?: () => void;
}

export default function ScamDetectionForm({
  language,
  onSubmit,
}: ScamDetectionFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if at least one field is filled
    if (!email && !phone && !listingUrl && !address && !file) {
      alert("Please fill at least one field or upload a lease agreement.");
      setIsSubmitting(false);
      return;
    }

    // Create form data to send
    const formData = new FormData();
    if (email) formData.append("email", email);
    if (phone) formData.append("phone", phone);
    if (listingUrl) formData.append("listing_url", listingUrl);
    if (address) formData.append("address", address);
    if (file) formData.append("file", file);
    formData.append("language", language);

    try {
      // In a real implementation, this would send the data to the backend
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scam-detection/analyze`, {
      //   method: 'POST',
      //   body: formData,
      // });

      // Mock response for now
      console.log("Form submitted with:", Object.fromEntries(formData));
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSubmit) onSubmit();
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const translations = {
    english: {
      title: "Check Your Rental for Scams",
      subtitle:
        "Enter information about your rental listing or upload a lease agreement",
      emailLabel: "Landlord Email",
      phoneLabel: "Landlord Phone",
      urlLabel: "Listing URL",
      addressLabel: "Property Address",
      fileLabel: "Upload Lease Agreement",
      fileHelp: "Upload PDF or Word document",
      submitButton: "Check for Scams",
      atLeastOneField: "Please provide at least one piece of information",
    },
    spanish: {
      title: "Verifica tu Alquiler por Estafas",
      subtitle:
        "Ingresa información sobre tu listado de alquiler o sube un contrato de arrendamiento",
      emailLabel: "Correo del Arrendador",
      phoneLabel: "Teléfono del Arrendador",
      urlLabel: "URL del Listado",
      addressLabel: "Dirección de la Propiedad",
      fileLabel: "Subir Contrato de Arrendamiento",
      fileHelp: "Subir documento PDF o Word",
      submitButton: "Verificar Estafas",
      atLeastOneField:
        "Por favor, proporciona al menos una pieza de información",
    },
    chinese: {
      title: "检查您的租赁是否存在诈骗",
      subtitle: "输入您的租赁信息或上传租赁协议",
      emailLabel: "房东邮箱",
      phoneLabel: "房东电话",
      urlLabel: "租赁链接",
      addressLabel: "物业地址",
      fileLabel: "上传租赁协议",
      fileHelp: "上传PDF或Word文档",
      submitButton: "检查诈骗",
      atLeastOneField: "请至少提供一条信息",
    },
    hindi: {
      title: "अपने किराये को धोखाधड़ी के लिए जांचें",
      subtitle:
        "अपने किराये की लिस्टिंग के बारे में जानकारी दर्ज करें या लीज एग्रीमेंट अपलोड करें",
      emailLabel: "मकान मालिक का ईमेल",
      phoneLabel: "मकान मालिक का फोन",
      urlLabel: "लिस्टिंग URL",
      addressLabel: "संपत्ति का पता",
      fileLabel: "लीज एग्रीमेंट अपलोड करें",
      fileHelp: "PDF या Word दस्तावेज़ अपलोड करें",
      submitButton: "धोखाधड़ी के लिए जांचें",
      atLeastOneField: "कृपया कम से कम एक जानकारी प्रदान करें",
    },
  };

  const t =
    translations[language as keyof typeof translations] || translations.english;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-block relative mb-2">
          <span className="text-4xl animate-float inline-block">🕵️</span>
          <span className="absolute top-0 right-0 text-2xl animate-pulse-slow">
            🔍
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
        <p className="text-gray-300">{t.subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md backdrop-blur-sm border border-gray-700 relative overflow-hidden"
      >
        {/* Fun decoration elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-blue-500/20 blur-xl animate-float"></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-pink-500/20 blur-xl animate-pulse-slow"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label
              className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
              htmlFor="email"
            >
              {t.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="group">
            <label
              className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
              htmlFor="phone"
            >
              {t.phoneLabel}
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="listingUrl"
          >
            {t.urlLabel}
          </label>
          <div className="relative">
            <input
              id="listingUrl"
              type="url"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://"
            />
            {listingUrl && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                🔗
              </span>
            )}
          </div>
        </div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="address"
          >
            {t.addressLabel}
          </label>
          <div className="relative">
            <input
              id="address"
              type="text"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {address && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                📍
              </span>
            )}
          </div>
        </div>

        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="fileUpload"
          >
            <div className="flex items-center gap-1">
              {t.fileLabel}
              <span className="text-lg animate-float inline-block">📄</span>
            </div>
          </label>
          <input
            id="fileUpload"
            type="file"
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white file:text-white file:bg-blue-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:hover:bg-blue-600 transition-all"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-1">{t.fileHelp}</p>
        </div>

        <p className="text-sm text-gray-300">{t.atLeastOneField}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden"
        >
          <span className="relative z-10">
            {isSubmitting ? <span>Loading...</span> : t.submitButton}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 transition-colors duration-200"></span>
        </button>
      </form>
    </div>
  );
}
