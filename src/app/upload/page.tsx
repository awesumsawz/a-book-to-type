"use client";

import { useState } from "react";
import Link from "next/link";
import FileUploader from "@/components/FileUpload/FileUploader";

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<{ 
    success: boolean; 
    message: string;
    textId?: string;
  } | null>(null);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-block mb-8 text-sm hover:underline">
          &larr; Back to Home
        </Link>
        
        <div className="w-full text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Upload Text for Typing Practice</h1>
          <p className="text-lg">
            Upload a PDF, text file, or document to practice your typing skills.
          </p>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm p-8">
          <FileUploader setUploadStatus={setUploadStatus} />
        </div>

        {uploadStatus && (
          <div className={`mt-8 p-4 rounded-lg ${uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="text-center">{uploadStatus.message}</p>
            {uploadStatus.success && uploadStatus.textId && (
              <div className="mt-4 flex justify-center">
                <Link 
                  href={`/practice?textId=${uploadStatus.textId}`}
                  className="py-2 px-6 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Start Typing
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Supported File Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">PDFs</h3>
              <p className="text-sm text-gray-600">Both text-based and image-based (via OCR)</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">Text Files</h3>
              <p className="text-sm text-gray-600">.txt, .rtf, and other plain text formats</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="font-medium">Documents</h3>
              <p className="text-sm text-gray-600">.docx and other document formats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 