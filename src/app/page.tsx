import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center max-w-3xl text-center">
        <h1 className="text-4xl sm:text-6xl font-bold">A Book to Type</h1>
        <p className="text-xl">
          Improve your typing skills while engaging with meaningful text content.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 w-full max-w-2xl">
          <div className="flex flex-col gap-4 p-6 border rounded-lg">
            <h2 className="text-2xl font-bold">Upload Text</h2>
            <p>Upload PDF documents or text files to practice your typing skills with content that matters to you.</p>
            <Link 
              href="/upload" 
              className="mt-auto py-2 px-4 bg-[#1a2b4b] text-white rounded-md hover:bg-[#2a3b5b] transition-colors"
            >
              Upload Document
            </Link>
          </div>
          
          <div className="flex flex-col gap-4 p-6 border rounded-lg">
            <h2 className="text-2xl font-bold">Practice Typing</h2>
            <p>Start a typing session with sample text or continue with your previously uploaded documents.</p>
            <Link 
              href="/practice" 
              className="mt-auto py-2 px-4 bg-[#1a2b4b] text-white rounded-md hover:bg-[#2a3b5b] transition-colors"
            >
              Start Practice
            </Link>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm">Monitor your typing speed, accuracy, and improvement over time.</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Save Sessions</h3>
            <p className="text-sm">Resume your typing practice from where you left off anytime.</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Analyze Errors</h3>
            <p className="text-sm">Identify common mistakes and focus on improving problem areas.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
