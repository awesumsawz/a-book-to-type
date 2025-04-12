"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowUpTrayIcon, DocumentTextIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface FileUploaderProps {
  setUploadStatus: (status: { 
    success: boolean; 
    message: string;
    textId?: string;
  } | null) => void;
}

export default function FileUploader({ setUploadStatus }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsProcessing(true);
    setUploadStatus(null);
    
    // Check file type
    const validTypes = ['application/pdf', 'text/plain', 'application/rtf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setIsProcessing(false);
      setUploadStatus({
        success: false,
        message: `Unsupported file type: ${file.type}. Please upload a PDF, TXT, RTF, or DOCX file.`
      });
      return;
    }
    
    // Here we would normally send the file to the server for processing
    // For now, we'll simulate a successful upload with a timeout
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate server processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful response
      const mockTextId = `text_${Date.now()}`;
      
      setUploadStatus({
        success: true,
        message: `Successfully processed "${file.name}"!`,
        textId: mockTextId
      });
    } catch (error) {
      setUploadStatus({
        success: false,
        message: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsProcessing(false);
    }
  }, [setUploadStatus]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });
  
  return (
    <div>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'bg-[#2a3b5b] border-[#3a4b6b] text-white' : 'border-[#2a3b5b]'}
          ${isDragReject ? 'border-red-500 bg-red-900/50' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a3b5b] hover:border-[#3a4b6b]'}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="flex flex-col items-center justify-center gap-3">
          {isDragReject ? (
            <>
              <ExclamationCircleIcon className="h-10 w-10 text-red-400" />
              <p className="text-red-400">File type not supported</p>
            </>
          ) : isProcessing ? (
            <>
              <div className="animate-spin h-10 w-10 border-2 border-[#3a4b6b] border-t-transparent rounded-full" />
              <p className="text-gray-300">Processing your file...</p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <ArrowUpTrayIcon className="h-10 w-10 text-white" />
              ) : (
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              )}
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-300">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: PDF, TXT, RTF, DOCX
              </p>
            </>
          )}
        </div>
      </div>
      
      {isProcessing && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>This may take a moment depending on the file size and type...</p>
        </div>
      )}
    </div>
  );
} 