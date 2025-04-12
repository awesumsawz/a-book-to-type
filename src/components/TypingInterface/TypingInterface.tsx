"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";
import TypingMetrics from "@/components/UserMetrics/TypingMetrics";

interface TypingInterfaceProps {
  text: string;
}

export default function TypingInterface({ text }: TypingInterfaceProps) {
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [completedCharacters, setCompletedCharacters] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const characters = text.split("");
  
  // Calculate metrics
  const wpm = useCallback(() => {
    if (!startTime || !currentTime) return 0;
    
    const timeElapsed = (currentTime - startTime) / 1000 / 60; // in minutes
    if (timeElapsed <= 0) return 0;
    
    // Standard calculation: 5 characters = 1 word
    return Math.round((completedCharacters / 5) / timeElapsed);
  }, [startTime, currentTime, completedCharacters]);
  
  const accuracy = useCallback(() => {
    if (completedCharacters === 0) return 100;
    return Math.round(((completedCharacters - errors) / completedCharacters) * 100);
  }, [completedCharacters, errors]);
  
  // Update timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());
      setCurrentTime(Date.now());
    }
    
    const value = e.target.value;
    setInput(value);
    
    // Check for errors and completed characters
    const textSoFar = text.substring(0, value.length);
    let errorCount = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== textSoFar[i]) {
        errorCount++;
      }
    }
    
    setCompletedCharacters(value.length);
    setErrors(errorCount);
    
    // Check if typing is complete
    if (value.length === text.length) {
      setIsActive(false);
      setShowMetrics(true);
    }
  };
  
  // Focus the input field when practice starts
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Restart practice
  const handleRestart = () => {
    setInput("");
    setIsActive(false);
    setStartTime(null);
    setCurrentTime(null);
    setCompletedCharacters(0);
    setErrors(0);
    setShowMetrics(false);
    
    // Scroll wrapper back to top
    if (wrapperRef.current) {
      wrapperRef.current.scrollTop = 0;
    }
    
    // Focus input after a short delay to let UI update
    setTimeout(focusInput, 50);
  };
  
  // Toggle play/pause
  const toggleActive = () => {
    if (!startTime && !isActive) {
      // Starting for the first time
      setIsActive(true);
      setStartTime(Date.now());
      setCurrentTime(Date.now());
      focusInput();
    } else {
      // Toggling pause/resume
      setIsActive(!isActive);
      
      if (!isActive) {
        // When resuming, adjust the start time to account for the pause duration
        if (startTime && currentTime) {
          const pauseDuration = Date.now() - currentTime;
          setStartTime(startTime + pauseDuration);
        }
        setCurrentTime(Date.now());
        focusInput();
      }
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-[#0f1b31]">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-[#1a2b4b] border-b border-[#2a3b5b] p-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleActive}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a2b4b] text-white hover:bg-[#2a3b5b] transition-colors"
            aria-label={isActive ? "Pause" : "Play"}
          >
            {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleRestart}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a2b4b] text-white hover:bg-[#2a3b5b] transition-colors"
            aria-label="Restart"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              showMetrics ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            aria-label="Show Metrics"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-medium mr-1">Speed:</span>
            <span>{wpm()} WPM</span>
          </div>
          <div>
            <span className="font-medium mr-1">Accuracy:</span>
            <span>{accuracy()}%</span>
          </div>
          {startTime && currentTime && (
            <div>
              <span className="font-medium mr-1">Time:</span>
              <span>{Math.floor(((currentTime - startTime) / 1000) / 60)}m {Math.floor(((currentTime - startTime) / 1000) % 60)}s</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Typing Area */}
      <div className="relative" onClick={focusInput}>
        {showMetrics && completedCharacters > 0 && (
          <div className="absolute inset-0 bg-[#0f1b31] text-white z-10 p-6 overflow-auto shadow-inner">
            <TypingMetrics 
              wpm={wpm()}
              accuracy={accuracy()}
              totalCharacters={text.length}
              typedCharacters={completedCharacters}
              errors={errors}
              timeElapsed={startTime && currentTime ? (currentTime - startTime) / 1000 : 0}
            />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleRestart}
                className="py-2 px-6 bg-[#1a2b4b] text-white rounded-md hover:bg-[#2a3b5b] transition-colors shadow-sm"
              >
                Practice Again
              </button>
            </div>
          </div>
        )}
        
        <div 
          ref={wrapperRef}
          className="p-6 max-h-96 overflow-y-auto bg-[#0f1b31] text-white relative shadow-inner"
        >
          <div className="text-lg leading-relaxed font-mono whitespace-pre-wrap">
            {characters.map((char, index) => {
              let status = 'text-gray-400'; // Default: not typed yet
              
              if (index < input.length) {
                status = input[index] === char ? 'text-white' : 'text-red-400 bg-red-900'; // Correct or Error
              } else if (index === input.length) {
                status = 'text-white bg-[#2a3b5b]'; // Current position
              }
              
              return (
                <span 
                  key={index} 
                  className={status}
                  style={{ 
                    display: char === '\n' ? 'block' : 'inline',
                    height: char === '\n' ? '1.5em' : 'auto'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="absolute opacity-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={!isActive}
          aria-label="Typing input"
        />
      </div>
    </div>
  );
} 