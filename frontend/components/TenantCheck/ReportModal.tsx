"use client";

import { useState, useRef } from "react";
import { api, SuspectLeaser, Language } from "../../services/api";
import { tenantCheckTranslations } from "../../services/constants";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaser: SuspectLeaser;
  language: Language;
  onReportSuccess: (newCount: number) => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  leaser,
  language,
  onReportSuccess,
}: ReportModalProps) {
  // Get translations based on selected language
  const t =
    tenantCheckTranslations[language] || tenantCheckTranslations.english;

  // Form state
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation states for fake verification
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedPoints, setAnalyzedPoints] = useState<string[]>([]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (files.length === 0) {
        setError(
          t.reportNoFilesError ||
            "Please upload at least one document as evidence"
        );
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      // Start fake verification process
      runFakeVerification();
    }
  };

  const runFakeVerification = () => {
    setIsAnalyzing(true);
    setVerificationProgress(0);
    setAnalyzedPoints([]);

    // Fake verification steps with delayed appearance
    const verificationSteps = [
      t.reportVerifyingFiles || "Verifying uploaded files...",
      t.reportAnalyzingContent || "Analyzing document content...",
      t.reportCheckingMetadata || "Checking document metadata...",
      t.reportValidatingEvidence || "Validating evidence...",
      t.reportConfirmingIdentity || "Confirming your identity...",
    ];

    // Simulate progress with timers
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < verificationSteps.length) {
        setAnalyzedPoints((prev) => [...prev, verificationSteps[currentStep]]);
        currentStep++;
        setVerificationProgress(
          Math.min(85, (currentStep / verificationSteps.length) * 100)
        );
      } else {
        clearInterval(stepInterval);
        // After all steps complete, submit the actual report
        submitReport();
      }
    }, 1200); // Each step takes 1.2 seconds
  };

  const submitReport = async () => {
    setIsSubmitting(true);

    try {
      // Simulate final verification
      setVerificationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Make actual API call to increment the report count
      const response = await api.suspectLeasers.reportSuspectLeaser(leaser.id);

      if (response.success) {
        setStep(3); // Move to success step
        setSuccessMessage(
          t.reportSuccessMessage || "Report submitted successfully"
        );
        onReportSuccess(response.reported_count);
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (err) {
      console.error("Error reporting suspect leaser:", err);
      setError(
        t.reportErrorMessage ||
          "An error occurred while submitting your report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {t.reportModalTitle || "Report Suspicious Leaser"}
          </h2>

          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-red-900/30 rounded-lg">
                <p className="text-white font-medium">
                  {t.reportingPerson || "You are reporting:"} {leaser.name}
                </p>
                <p className="text-gray-300 text-sm">
                  {t.reportCurrentCount || "Current report count:"}{" "}
                  {leaser.reported_count}
                </p>
              </div>

              <p className="text-gray-300">
                {t.reportEvidenceNote ||
                  "Please provide evidence such as lease documents, screenshots of communication, or any other proof that supports your report."}
              </p>

              <div className="space-y-2">
                <label className="block text-white font-medium mb-1">
                  {t.reportUploadEvidence || "Upload Evidence"}
                </label>

                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {t.reportBrowseFiles || "Browse files"}
                  </button>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-gray-300 font-medium">
                      {t.reportUploadedFiles || "Uploaded files"}:
                    </h4>
                    <ul className="text-sm space-y-2">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-700 rounded"
                        >
                          <span className="text-gray-300 truncate">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-300">
                {t.reportVerifyingYourSubmission ||
                  "We are verifying your submission and analyzing the uploaded evidence."}
              </p>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-400 mt-1">
                  {verificationProgress.toFixed(0)}%
                </div>
              </div>

              {/* Analysis steps */}
              <div className="space-y-3 pt-2">
                {analyzedPoints.map((point, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{point}</span>
                  </div>
                ))}

                {isAnalyzing && analyzedPoints.length < 5 && (
                  <div className="flex items-center text-sm">
                    <svg
                      className="animate-spin h-4 w-4 text-blue-500 mr-2"
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
                    <span className="text-gray-300">
                      {t.reportProcessing || "Processing..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="inline-block p-3 rounded-full bg-green-900/30 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.reportThankYou || "Thank You!"}
              </h3>
              <p className="text-gray-300">{successMessage}</p>
              <p className="text-gray-400 text-sm mt-2">
                {t.reportUpdatedCount || "Updated report count"}:{" "}
                {leaser.reported_count + 1}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer/Buttons */}
        <div className="flex justify-end space-x-3">
          {step === 1 && (
            <>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t.cancelButton || "Cancel"}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={handleNextStep}
                disabled={files.length === 0 || isSubmitting}
              >
                {t.continueButton || "Continue"}
              </button>
            </>
          )}

          {step === 2 && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={handleNextStep}
              disabled={isSubmitting || isAnalyzing}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {t.submittingText || "Submitting"}
                </span>
              ) : (
                t.verifyAndSubmitButton || "Verify & Submit"
              )}
            </button>
          )}

          {step === 3 && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={onClose}
            >
              {t.closeButton || "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
