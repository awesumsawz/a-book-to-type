'use client';

import React, { useState, ChangeEvent, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

// Set up PDF.js worker source
// This is crucial for PDF.js to work correctly in a web environment.
// We point it to the copy of the worker file provided by the pdfjs-dist package.
// Adjust the path based on your build setup if necessary.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'];
const ACCEPTED_FILE_TYPES = '.pdf,.txt,' + SUPPORTED_IMAGE_TYPES.join(',');

interface InputAreaProps {
  onTextChange: (text: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onTextChange }) => {
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const processPdfWithPdfjs = async (file: File): Promise<string> => {
    setLoadingMessage('Extracting text from PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        setLoadingMessage(`Extracting text from PDF (page ${i}/${pdf.numPages})...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Join items with spaces and pages with double newlines
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n'; 
    }
    // Basic cleanup: trim whitespace, replace multiple spaces/newlines
    return fullText.replace(/\s{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  };

  // Basic OCR function (can be expanded)
  const processWithOcr = async (file: File): Promise<string> => {
      setLoadingMessage('OCR: Initializing worker...');
      // Tesseract language codes - add more as needed: https://tesseract-ocr.github.io/tessdoc/Data-Files#data-files-for-version-400-november-29-2016
      const worker = await Tesseract.createWorker('eng', 1, {
          logger: m => {
              console.log('Tesseract:', m);
              if (m.status === 'recognizing text') {
                  setLoadingMessage(`OCR: Recognizing text (${Math.round(m.progress * 100)}%)...`);
              } else if (m.status) {
                  // Capitalize first letter for display
                  const statusMsg = m.status.charAt(0).toUpperCase() + m.status.slice(1);
                  setLoadingMessage(`OCR: ${statusMsg}...`);
              }
          },
          // Consider hosting worker files locally for production
          // workerPath: '/tesseract/worker.min.js',
          // corePath: '/tesseract/tesseract-core.wasm.js',
          // langPath: '/tesseract/lang-data'
      });
      const ret = await worker.recognize(file);
      setLoadingMessage('OCR processing complete.');
      await worker.terminate();
      console.log('OCR Result:', ret.data);
      return ret.data.text;
  }

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToastId = toast.loading('Processing file...');
    setIsLoading(true);
    setLoadingMessage('Processing file...');
    setPastedText('');
    onTextChange('');

    try {
      if (file.type === 'text/plain') {
        setLoadingMessage('Reading text file...');
        toast.loading('Reading text file...', { id: loadingToastId });
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = (e.target?.result as string) || '';
          onTextChange(text.trim());
          toast.success('Text file loaded!', { id: loadingToastId });
          setIsLoading(false);
        };
        reader.onerror = () => {
          console.error('Error reading file');
          toast.error('Error reading text file.', { id: loadingToastId });
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        let text = '';
        let pdfExtracted = false;
        try {
            toast.loading('Extracting text from PDF...', { id: loadingToastId });
            setLoadingMessage('Extracting text from PDF...');
            text = await processPdfWithPdfjs(file);
            console.log(`Direct PDF extraction resulted in ${text.length} characters.`);
            pdfExtracted = true;
        } catch (pdfError: any) {
            console.warn('Direct PDF text extraction failed:', pdfError);
            toast.error(`PDF processing error: ${pdfError?.message || 'Unknown error'}`, { id: loadingToastId });
        }

        if (pdfExtracted && text.length > 50) {
            onTextChange(text);
            toast.success('PDF text extracted successfully!', { id: loadingToastId });
            setIsLoading(false);
        } else {
            if (pdfExtracted) {
                console.warn("Direct text extraction yielded little/no result, attempting OCR fallback...");
                toast('Trying OCR on PDF (this may take a while)... ', { id: loadingToastId, duration: 60000 });
            } else {
                toast('Could not extract text directly. Trying OCR on PDF (this may take a while)... ', { id: loadingToastId, duration: 60000 });
            }
            try {
                const ocrText = await processWithOcr(file);
                onTextChange(ocrText);
                toast.success('OCR fallback completed!', { id: loadingToastId });
            } catch (ocrError: any) {
                console.error("OCR fallback processing failed:", ocrError);
                toast.error(`OCR processing failed: ${ocrError?.message || 'Unknown OCR error'}`, { id: loadingToastId });
            }
            setIsLoading(false);
        }
      } else if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          console.log("Image file detected, attempting OCR...");
          toast.loading('Processing image with OCR (this may take a while)... ', { id: loadingToastId, duration: 60000 });
          try {
              const ocrText = await processWithOcr(file);
              onTextChange(ocrText);
              toast.success('Image OCR completed!', { id: loadingToastId });
          } catch (ocrError: any) {
              console.error("Image OCR processing failed:", ocrError);
              toast.error(`Image OCR processing failed: ${ocrError?.message || 'Unknown OCR error'}`, { id: loadingToastId });
          }
          setIsLoading(false);
      } else {
        console.warn('Unsupported file type:', file.type);
        toast.error(`Unsupported file type (${file.type}). Please upload: ${ACCEPTED_FILE_TYPES}`, { id: loadingToastId });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error(`An error occurred: ${error?.message || 'Unknown error'}`, { id: loadingToastId });
      setIsLoading(false);
    }

  }, [onTextChange]);

  const handlePasteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    const text = event.target.value;
    setPastedText(text);
    onTextChange(text);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <section className="flex flex-col sm:flex-row gap-4 items-start relative">
      {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex justify-center items-center z-20 rounded-md">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          </div>
      )}
      <div className="flex-1">
        <label htmlFor="file-upload" className="block text-sm font-medium text-muted mb-2">
          Upload File (PDF, TXT, PNG, JPG...)
        </label>
        <input
          id="file-upload"
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="block w-full text-sm text-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-background
            hover:file:bg-primary/90 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center text-muted pt-8">or</div>
      <div className="flex-1">
        <label htmlFor="text-paste" className="block text-sm font-medium text-muted mb-2">
          Paste Text
        </label>
        <textarea
          id="text-paste"
          rows={4}
          className="block w-full p-2 rounded-md border border-muted bg-dimmed text-foreground focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Paste your text here..."
          value={pastedText}
          onChange={handlePasteChange}
          disabled={isLoading}
        />
      </div>
    </section>
  );
};

export default InputArea; 