import { useParams } from "react-router-dom";
import { useCertificateVerify } from "@/hooks/index";
import { PageLoader } from "@/components/common/Loader";
import { ErrorState } from "@/components/common/ErrorState";
import { Award, CheckCircle, XCircle } from "lucide-react";

export function CertificateVerifyPage() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const { data, isLoading, error } = useCertificateVerify(
    certificateNumber || ""
  );

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorState message="Unable to verify certificate. Please try again." />
      </div>
    );
  }

  const isValid = data?.valid === true;
  const cert = data?.certificate;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className={`px-8 py-10 text-center ${
            isValid ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {isValid ? (
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {isValid ? "Certificate Verified" : "Certificate Not Found"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isValid
              ? "This certificate is valid and authentic."
              : "No certificate was found with this number."}
          </p>
        </div>

        {isValid && cert && (
          <div className="px-8 py-8">
            <div className="text-center mb-6">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h2 className="text-lg font-semibold text-blue-800">
                {cert.institution}
              </h2>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Student</span>
                <span className="font-medium text-gray-900">
                  {cert.studentName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Course</span>
                <span className="font-medium text-gray-900">{cert.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Completion Date</span>
                <span className="font-medium text-gray-900">
                  {cert.completionDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate Number</span>
                <span className="font-mono text-sm text-gray-900">
                  {cert.certificateNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cert.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cert.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isValid && (
          <div className="px-8 py-6 text-center">
            <p className="text-sm text-gray-500">
              Please check the certificate number and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
