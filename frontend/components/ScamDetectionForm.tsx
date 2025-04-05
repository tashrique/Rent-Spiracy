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
    if (email) formData.append("landlord_email", email);
    if (phone) formData.append("landlord_phone", phone);
    if (listingUrl) formData.append("listing_url", listingUrl);
    if (address) formData.append("property_address", address);
    if (file) formData.append("lease_document", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listings/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || 'Failed to submit listing');
      }

      const result = await response.json();
      console.log("Analysis result:", result);
      
      // Call onSubmit callback with the result
      if (onSubmit) onSubmit();

      // Clear form
      setEmail("");
      setPhone("");
      setListingUrl("");
      setAddress("");
      setFile(null);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form: " + (error as Error).message);
    } finally {
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
        <h1 className="text-3xl font-bold mb-2 text-white">{t.title}</h1>
        <p className="text-gray-300">{t.subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-semibold mb-1 text-gray-200"
              htmlFor="email"
            >
              {t.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-1 text-gray-200"
              htmlFor="phone"
            >
              {t.phoneLabel}
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-1 text-gray-200"
            htmlFor="listingUrl"
          >
            {t.urlLabel}
          </label>
          <input
            id="listingUrl"
            type="url"
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            value={listingUrl}
            onChange={(e) => setListingUrl(e.target.value)}
            placeholder="https://"
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-1 text-gray-200"
            htmlFor="address"
          >
            {t.addressLabel}
          </label>
          <input
            id="address"
            type="text"
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-1 text-gray-200"
            htmlFor="fileUpload"
          >
            {t.fileLabel}
          </label>
          <input
            id="fileUpload"
            type="file"
            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white file:text-white file:bg-blue-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-2"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-1">{t.fileHelp}</p>
        </div>

        <p className="text-sm text-gray-300">{t.atLeastOneField}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? <span>Loading...</span> : t.submitButton}
        </button>
      </form>
    </div>
  );
}
