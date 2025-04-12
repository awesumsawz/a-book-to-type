"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import TypingInterface from "@/components/TypingInterface/TypingInterface";

// For demo purposes, we'll use some sample texts
const sampleTexts = {
  text_1: {
    title: "The Great Gatsby",
    content: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing anyone,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'"
  },
  text_2: {
    title: "1984",
    content: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him."
  }
};

export default function PracticePage() {
  const searchParams = useSearchParams();
  const textId = searchParams.get("textId");
  
  const [text, setText] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real application, we would fetch the text from an API
    // For now, we'll simulate with the sample texts or use the textId to find a specific one
    const loadText = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (textId) {
          // If a specific textId was provided
          if (textId.startsWith("text_") && !isNaN(Number(textId.split("_")[1]))) {
            // Use one of our sample texts
            const num = Number(textId.split("_")[1]);
            const key = `text_${num % 2 + 1}` as keyof typeof sampleTexts;
            setText(sampleTexts[key]);
          } else {
            // In a real app, we would fetch from the database here
            // For now, just use a random sample
            const keys = Object.keys(sampleTexts) as Array<keyof typeof sampleTexts>;
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            setText(sampleTexts[randomKey]);
          }
        } else {
          // If no textId was provided, use a random sample
          const keys = Object.keys(sampleTexts) as Array<keyof typeof sampleTexts>;
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          setText(sampleTexts[randomKey]);
        }
      } catch (err) {
        setError("Failed to load text. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadText();
  }, [textId]);
  
  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-block mb-8 text-sm hover:underline">
          &larr; Back to Home
        </Link>
        
        <div className="w-full text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Typing Practice</h1>
          {text && <p className="text-lg font-medium">{text.title}</p>}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading text...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 py-1.5 px-4 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        ) : text ? (
          <TypingInterface text={text.content} />
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-center">
            <p>No text found. Please upload a document first.</p>
            <Link 
              href="/upload" 
              className="mt-4 inline-block py-1.5 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Upload Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 