import { createWorker } from 'tesseract.js';
import pdfjsLib from 'pdf-parse';

/**
 * Process text file and extract content
 */
export async function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Process PDF file and extract text
 */
export async function processPdfFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read PDF file'));
        return;
      }
      
      try {
        // Try to extract text directly from PDF
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const parsedPdf = await pdfjsLib(data);
        
        if (parsedPdf.text && parsedPdf.text.trim().length > 0) {
          // If we successfully extracted text, return it
          resolve(parsedPdf.text);
        } else {
          // If no text was extracted, try OCR
          resolve(await processPdfWithOCR(file));
        }
      } catch (error) {
        // If direct extraction fails, try OCR
        try {
          const ocrText = await processPdfWithOCR(file);
          resolve(ocrText);
        } catch (ocrError) {
          reject(new Error(`Failed to process PDF: ${error}`));
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading PDF file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Process PDF using OCR (for image-based PDFs)
 */
async function processPdfWithOCR(file: File): Promise<string> {
  // This is a simplified implementation
  // In a real app, we would convert PDF pages to images and process them
  
  const worker = await createWorker('eng');
  
  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Process any uploaded file based on its type
 */
export async function processFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    return processPdfFile(file);
  } else if (fileType === 'text/plain' || fileType === 'application/rtf') {
    return processTextFile(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For DOCX files, we'd need additional processing
    // For now, return a placeholder message
    return "DOCX processing is not yet implemented";
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
} 