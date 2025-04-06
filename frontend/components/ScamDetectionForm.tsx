"use client";

import { useState, useRef } from "react";
import {
  scamDetectionApi,
  ScamDetectionResponse,
  Language,
} from "../services/api";
import { translations } from "../services/constants";
import TenantCheckPanel from "./TenantCheck/TenantCheckPanel";

interface ScamDetectionFormProps {
  language: string;
  onSubmit: (results: ScamDetectionResponse) => void;
}

// Add type definition for translations
interface TranslationType {
  title: string;
  subtitle: string;
  urlLabel: string;
  addressLabel: string;
  fileLabel: string;
  fileHelp: string;
  photoLabel: string;
  takePhotoLabel: string;
  galleryLabel: string;
  submitButton: string;
  atLeastOneField: string;
  submittingText: string;
  errorText: string;
  analysisStage1: string;
  analysisStage2: string;
  analysisStage3: string;
  analysisStage4: string;
  legalDisclaimer: string;
}

export default function ScamDetectionForm({
  language,
  onSubmit,
}: ScamDetectionFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const t =
    (translations[language as keyof typeof translations] as TranslationType) ||
    (translations.english as TranslationType);

  // Check if language is a valid Language type, default to English if not
  const validateLanguage = (lang: string): Language => {
    const validLanguages: Language[] = [
      "english",
      "spanish",
      "chinese",
      "hindi",
      "korean",
      "bengali",
      "swahili",
      "arabic",
    ];
    return validLanguages.includes(lang as Language)
      ? (lang as Language)
      : "english";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        const errorMsg = `File too large (max 10MB). This file is ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB.`;
        setError(errorMsg);

        // Announce error to screen readers
        const announcer = document.getElementById("announcer");
        if (announcer) {
          announcer.textContent = `Error: ${errorMsg}`;
        }
        return;
      }

      // Simple check for password-protected PDF
      if (file.type === "application/pdf") {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const pdfContent = new TextDecoder().decode(
            uint8Array.slice(0, 1024)
          );

          // Most encrypted PDFs have "/Encrypt" in their header
          if (pdfContent.includes("/Encrypt")) {
            const errorMsg =
              "This PDF appears to be password-protected. Please upload an unprotected document.";
            setError(errorMsg);

            // Announce error to screen readers
            const announcer = document.getElementById("announcer");
            if (announcer) {
              announcer.textContent = `Error: ${errorMsg}`;
            }
            return;
          }
        } catch (err) {
          console.error("Error checking PDF file:", err);
          // Continue anyway, let the server handle it
        }
      }

      setSelectedFiles((prev) => [...prev, file]);
      setUploadProgress(0);
      setAnalysisStage(null);

      // Announce to screen readers
      const announcer = document.getElementById("announcer");
      if (announcer) {
        announcer.textContent = `File ${file.name} added successfully.`;
      }
    }
  };

  const removeFile = (index: number) => {
    const fileName = selectedFiles[index]?.name || "File";
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    // Announce to screen readers
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = `${fileName} removed.`;
    }
  };

  const handleCapturePhoto = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError(t.atLeastOneField);

      // Announce error to screen readers
      const announcer = document.getElementById("announcer");
      if (announcer) {
        announcer.textContent = `Error: ${t.atLeastOneField}`;
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);
    setAnalysisStage(t.analysisStage1);

    // Announce to screen readers that submission started
    const announcer = document.getElementById("announcer");
    if (announcer) {
      announcer.textContent = t.analysisStage1;
    }

    const apiLanguage = validateLanguage(language) as
      | "english"
      | "spanish"
      | "chinese"
      | "hindi"
      | "korean"
      | "bengali"
      | "swahili"
      | "arabic";

    try {
      let response;

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          let newStage = analysisStage;

          if (newProgress > 25 && newProgress <= 50) {
            newStage = t.analysisStage2;
            setAnalysisStage(newStage);

            // Announce stage change to screen readers
            const announcer = document.getElementById("announcer");
            if (announcer) {
              announcer.textContent = newStage;
            }
          } else if (newProgress > 50 && newProgress <= 75) {
            newStage = t.analysisStage3;
            setAnalysisStage(newStage);

            // Announce stage change to screen readers
            const announcer = document.getElementById("announcer");
            if (announcer) {
              announcer.textContent = newStage;
            }
          } else if (newProgress > 75) {
            newStage = t.analysisStage4;
            setAnalysisStage(newStage);

            // Announce stage change to screen readers
            const announcer = document.getElementById("announcer");
            if (announcer) {
              announcer.textContent = newStage;
            }
          }
          return Math.min(newProgress, 95);
        });
      }, 500);

      if (selectedFiles.length > 0) {
        console.log(`Uploading ${selectedFiles.length} files`);

        try {
          if (selectedFiles.length === 1) {
            response = await scamDetectionApi.uploadDocument(
              selectedFiles[0],
              undefined,
              undefined,
              apiLanguage,
              false
            );
          } else {
            response = await scamDetectionApi.uploadMultipleDocuments(
              selectedFiles,
              undefined,
              undefined,
              apiLanguage,
              false
            );
          }

          console.log("File upload response:", response);
        } catch (error) {
          console.error("Upload error:", error);
          clearInterval(progressInterval);

          // Extract error message for better user feedback
          let errorMessage = t.errorText;
          if (error instanceof Error) {
            // Enhance specific error types with more helpful messages
            if (
              error.message.includes("password-protected") ||
              error.message.includes("encrypted")
            ) {
              errorMessage =
                "This document appears to be password-protected. Please remove the password protection and try again.";
            } else if (error.message.includes("corrupted")) {
              errorMessage =
                "This document appears to be corrupted. Please try a different file.";
            } else if (error.message.includes("size")) {
              errorMessage =
                "File size exceeds the maximum allowed limit (10MB).";
            } else {
              errorMessage = error.message;
            }
          }

          setError(errorMessage);
          setIsSubmitting(false);
          return;
        }
      } else {
        console.log("No files selected");
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response || !response.explanation) {
        console.error("Invalid response format:", response);
        throw new Error("Received invalid response format from server");
      }

      onSubmit(response);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(t.errorText);
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

      <TenantCheckPanel language={validateLanguage(language)} />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md backdrop-blur-sm border border-gray-700 relative overflow-hidden"
        ref={formRef}
      >
        <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-blue-500/20 blur-xl animate-float"></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-pink-500/20 blur-xl animate-pulse-slow"></div>

        <div className="space-y-4">
          <div className="group">
            <label
              className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors"
              htmlFor="file"
            >
              {t.fileLabel}
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.jpg,.jpeg,.png,.heic,.heif,image/*"
                multiple
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left p-2 border border-gray-600 rounded bg-gray-700 text-gray-300 hover:border-blue-500 hover:bg-gray-600 transition-all flex items-center justify-between"
                disabled={isSubmitting}
              >
                <span>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) selected`
                    : "Choose Document"}
                </span>
                <span className="text-blue-400">📄</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {t.fileHelp}{" "}
              <span className="text-blue-400">
                PDF, Text, Images (including HEIC/HEIF)
              </span>
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-3 bg-gray-700/50 rounded p-3 max-h-56 overflow-y-auto border border-gray-600">
              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <span className="mr-2">📂</span>
                Selected Files ({selectedFiles.length})
              </h4>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-300 p-2 bg-gray-750/50 rounded border border-gray-600"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {file.type.startsWith("image/") ? "🖼️" : "📄"}
                      </span>
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px] font-medium">
                          {file.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {file.type || "Unknown type"} •{" "}
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors ml-2 p-1 rounded"
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold mb-1 text-gray-200 group-hover:text-blue-300 transition-colors">
            {t.photoLabel}
          </label>
          <div className="flex flex-col space-y-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={photoInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="p-3 border border-gray-600 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all flex items-center justify-center"
                disabled={isSubmitting}
              >
                <span className="mr-2">📷</span>
                {t.takePhotoLabel}
              </button>
            </div>
          </div>
        </div>

        <div>
          {error && (
            <div className="text-red-400 mb-4 p-2 bg-red-900/30 rounded border border-red-900">
              {error}
            </div>
          )}

          {isSubmitting && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{analysisStage}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
            disabled={isSubmitting || selectedFiles.length === 0}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                <span className="mr-2">✓</span>
                <span>{t.submitButton}</span>
              </>
            )}
          </button>

          <div className="text-xs text-gray-500 italic mt-4 text-center">
            {t.legalDisclaimer}
          </div>
        </div>
      </form>
    </div>
  );
}
