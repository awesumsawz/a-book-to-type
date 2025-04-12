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

        <div className="w-full bg-[#0f1b31] text-white rounded-lg shadow-lg p-8">
          <FileUploader setUploadStatus={setUploadStatus} />
        </div>

        {uploadStatus && (
          <div className={`mt-8 p-4 rounded-lg shadow-md ${uploadStatus.success ? 'bg-green-900/90 text-green-100' : 'bg-red-900/90 text-red-100'}`}>
            <p className="text-center">{uploadStatus.message}</p>
            {uploadStatus.success && uploadStatus.textId && (
              <div className="mt-4 flex justify-center">
                <Link 
                  href={`/practice?textId=${uploadStatus.textId}`}
                  className="mt-4 inline-block py-1.5 px-4 bg-[#1a2b4b] text-white rounded-md hover:bg-[#2a3b5b] transition-colors text-sm shadow-sm"
                >
                  Start Typing
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 border rounded-lg p-6 bg-[#1a2b4b] text-white shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Supported File Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#0f1b31] rounded shadow-md">
              <h3 className="font-medium">PDFs</h3>
              <p className="text-sm text-gray-300">Both text-based and image-based (via OCR)</p>
            </div>
            <div className="p-3 bg-[#0f1b31] rounded shadow-md">
              <h3 className="font-medium">Text Files</h3>
              <p className="text-sm text-gray-300">.txt, .rtf, and other plain text formats</p>
            </div>
            <div className="p-3 bg-[#0f1b31] rounded shadow-md">
              <h3 className="font-medium">Documents</h3>
              <p className="text-sm text-gray-300">.docx and other document formats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 