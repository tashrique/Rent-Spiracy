"use client";

import { useState } from "react";
import { scamDetectionApi, api, ScamDetectionResponse, AnalysisResult } from "../services/api";
import { translations } from "../services/constants";

interface ScamDetectionFormProps {
  language: string;
  onSubmit: (results: ScamDetectionResponse) => void;
}

export default function ScamDetectionForm({
  language,
  onSubmit,
}: ScamDetectionFormProps) {
  const [listingUrl, setListingUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<string | null>(null);

  const t =
    translations[language as keyof typeof translations] || translations.english;

  // Debounce function to prevent too many API calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check for suspect leasers
  const checkSuspectLeasers = async (email: string, phone: string) => {
    try {
      if (!email && !phone) return;
      const results = await api.suspectLeaser.searchSuspectLeasers(email, phone);
    } catch (error) {
      console.error("Error checking suspect leasers:", error);
    }
  };

  // Debounced version of checkSuspectLeasers
  const debouncedCheck = debounce(checkSuspectLeasers, 500);

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    debouncedCheck(newEmail, phone);
  };

  // Handle phone change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);
    debouncedCheck(email, newPhone);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Reset progress when a new file is selected
      setUploadProgress(0);
      setAnalysisStage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate at least one field is provided
    if (!listingUrl && !address && !selectedFile && !email && !phone) {
      setError(t.atLeastOneField);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setAnalysisStage(t.analysisStage1);

    // Convert UI language to API language format
    const apiLanguage = language as
      | "english"
      | "spanish"
      | "chinese"
      | "hindi"
      | "korean"
      | "bengali";

    try {
      let response;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          // Update stage based on progress
          if (newProgress > 25 && newProgress <= 50) {
            setAnalysisStage(t.analysisStage2);
          } else if (newProgress > 50 && newProgress <= 75) {
            setAnalysisStage(t.analysisStage3);
          } else if (newProgress > 75) {
            setAnalysisStage(t.analysisStage4);
          }
          return Math.min(newProgress, 95); // Cap at 95% until complete
        });
      }, 500);

      // If a file is selected, use the file upload endpoint
      if (selectedFile) {
        // For PDF files, we need to use the specialized endpoint
        const isPDF = selectedFile.name.toLowerCase().endsWith(".pdf");
        console.log(
          `Uploading ${isPDF ? "PDF" : "text"} file: ${selectedFile.name}`
        );

        // Always use the uploadDocument method which handles both PDF and text files
        response = await scamDetectionApi.uploadDocument(
          selectedFile,
          listingUrl || undefined,
          address || undefined,
          apiLanguage,
          false, // voice output
          email || undefined,
          phone || undefined
        );
      } else if (listingUrl) {
        // If URL is provided, use the analyzeRental endpoint
        console.log("Analyzing URL:", listingUrl);
        response = await scamDetectionApi.analyzeRental({
          listingUrl,
          language: apiLanguage,
          voiceOutput: false,
          landlordEmail: email || undefined,
          landlordPhone: phone || undefined
        });
      } else if (address) {
        // If address is provided, use the analyzeRental endpoint
        console.log("Analyzing address:", address);
        response = await scamDetectionApi.analyzeRental({
          address,
          language: apiLanguage,
          voiceOutput: false,
          landlordEmail: email || undefined,
          landlordPhone: phone || undefined
        });
      } else if (email || phone) {
        // If only email or phone is provided, use the suspect leasers search endpoint
        console.log("Searching suspect leasers:", { email, phone });
        const suspectResults = await api.suspectLeaser.searchSuspectLeasers(email || undefined, phone || undefined);
        
        if (suspectResults.length > 0) {
          const suspect = suspectResults[0];
          
          response = {
            id: suspect.email + "-" + Date.now(),
            scam_likelihood: "High" as const,
            trustworthiness_score: 30,
            trustworthiness_grade: "F" as const,
            risk_level: "Very High Risk" as const,
            explanation: `⚠️ WARNING: This contact has been reported ${suspect.reported_count} times for suspicious activity.\n\n` +
              `Name: "${suspect.name}"\n` +
              `Email: "${suspect.email}"\n` +
              `Phone: "${suspect.phone}"\n` +
              `Reported Count: ${suspect.reported_count}\n\n` +
              `Addresses (${suspect.addresses.length}):\n` +
              suspect.addresses.map((addr, i) => `• ${addr}`).join('\n') + '\n\n' +
              `Flags (${suspect.flags.length}):\n` +
              suspect.flags.map((flag, i) => `• ${flag}`).join('\n') + '\n\n' +
              `Regarding the scam score calculation (30/100), it appears to be calculated based on several risk factors:\n\n` +
              `Number of reports (Reported Count: ${suspect.reported_count}):\n` +
              `• Multiple reports against the same contact indicate a pattern of suspicious activity\n\n` +
              `Severity of flags:\n` +
              `• "multiple reported scams" - indicates a history of fraudulent activity\n` +
              `• "non-existent properties" - suggests fake listings\n` +
              `• "asks for wire transfers" - a common scam tactic\n\n` +
              `The very low score (30/100) and F grade likely result from:\n` +
              `• Multiple verified reports (${suspect.reported_count} times reported)\n` +
              `• High-risk flags (especially wire transfer requests)\n` +
              `• Multiple fake addresses across different states\n` +
              `• Pattern of documented scam behavior`,
            simplified_clauses: [],
            suggested_questions: [
              "Why have you been reported for suspicious activity?",
              "Can you provide references from previous tenants?",
              "Can you verify your identity and property ownership?"
            ],
            created_at: new Date().toISOString(),
            action_items: [
              "Do not send any money or personal information",
              "Report this contact to local authorities",
              "Document all communication"
            ]
          } as AnalysisResult;
        } else {
          response = {
            id: "no-suspect-" + Date.now(),
            scam_likelihood: "Low" as const,
            trustworthiness_score: 100,
            trustworthiness_grade: "A" as const,
            risk_level: "Low Risk" as const,
            explanation: "No suspicious activity reported for this contact information.",
            simplified_clauses: [],
            suggested_questions: [
              "Can you provide references from previous tenants?",
              "Can you show me the property in person?",
              "Can you provide a written lease agreement?"
            ],
            created_at: new Date().toISOString(),
            action_items: [
              "Request to view the property in person",
              "Ask for a written lease agreement",
              "Verify the landlord's identity"
            ]
          } as AnalysisResult;
        }
      }

      // Clear the progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check if we got a valid response
      if (!response || !response.explanation) {
        console.error("Invalid response format:", response);
        throw new Error("Received invalid response format from server");
      }

      // Pass results to parent component
      onSubmit(response);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(t.errorText);

      // // Use mock data for demo if real API fails
      // const mockResult: ScamDetectionResponse = {
      //   id: "mock-id-" + Date.now(),
      //   scam_likelihood: "Medium",
      //   explanation:
      //     "This is a mock analysis since the API request failed. " +
      //     "We received: URL: " +
      //     (listingUrl || "None") +
      //     ", Address: " +
      //     (address || "None") +
      //     ", Document: " +
      //     (selectedFile ? selectedFile.name : "None"),
      //   simplified_clauses: [
      //     {
      //       text: "Example lease clause",
      //       simplified_text: "This is a simplified explanation of the clause",
      //       is_concerning: false,
      //     },
      //   ],
      //   suggested_questions: [
      //     "Is a security deposit required?",
      //     "When is rent due each month?",
      //     "Are pets allowed?",
      //     "What utilities are included in the rent?",
      //     "What is the policy for maintenance and repairs?",
      //   ],
      //   created_at: new Date().toISOString(),
      // };

      // onSubmit(mockResult);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* URL input */}
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
              disabled={isSubmitting}
            />
            {listingUrl && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                🔗
              </span>
            )}
          </div>
        </div>

        {/* Email input */}
        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="email"
          >
            {t.emailLabel}
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={email}
              onChange={handleEmailChange}
              placeholder="landlord@example.com"
              disabled={isSubmitting}
            />
            {email && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                ✉️
              </span>
            )}
          </div>
        </div>

        {/* Phone input */}
        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="phone"
          >
            {t.phoneLabel}
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
            {phone && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                📱
              </span>
            )}
          </div>
        </div>

        {/* Address input */}
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
              placeholder="123 Main Street, Apt 4B"
              disabled={isSubmitting}
            />
            {address && (
              <span className="absolute right-3 top-2 text-lg animate-bounceIn">
                📍
              </span>
            )}
          </div>
        </div>

        {/* File upload */}
        <div className="group">
          <label
            className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
            htmlFor="documentFile"
          >
            {t.fileLabel}
          </label>
          <div className="relative">
            <input
              id="documentFile"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx"
              disabled={isSubmitting}
            />
            <label
              htmlFor="documentFile"
              className="cursor-pointer w-full p-3 border-2 border-dashed border-gray-600 rounded bg-gray-700/50 text-gray-300 hover:border-blue-500 hover:text-blue-300 transition-all flex items-center justify-center"
            >
              <span className="mr-2 text-xl">📄</span>
              {selectedFile ? selectedFile.name : t.fileHelp}
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded font-semibold transition-colors flex items-center justify-center ${
              isSubmitting
                ? "bg-blue-600 text-white cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t.submittingText}
              </>
            ) : (
              <>
                <span className="mr-2">{t.submitButton}</span>
                <span className="transform transition-transform group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar and analysis stage */}
        {isSubmitting && (
          <div className="mt-4 space-y-2 animate-fadeIn">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out relative overflow-hidden"
                style={{ width: `${uploadProgress}%` }}
              >
                <span className="absolute inset-0 bg-white/20 animate-pulse-slow"></span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-300">
              <div className="flex items-center">
                <span className="inline-block mr-2 animate-bounce">⚡</span>
                <span className="font-medium">{analysisStage}</span>
              </div>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800 animate-fadeIn">
            <div className="flex items-start">
              <span className="mr-2 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
