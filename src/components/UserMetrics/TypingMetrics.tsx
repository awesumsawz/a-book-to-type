"use client";

import { useEffect, useState } from "react";

interface TypingMetricsProps {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  typedCharacters: number;
  errors: number;
  timeElapsed: number;
}

export default function TypingMetrics({
  wpm,
  accuracy,
  totalCharacters,
  typedCharacters,
  errors,
  timeElapsed
}: TypingMetricsProps) {
  const [savedStats, setSavedStats] = useState<{
    date: string;
    wpm: number;
    accuracy: number;
  }[]>([]);
  
  useEffect(() => {
    // Save current stats to localStorage
    const newStat = {
      date: new Date().toISOString(),
      wpm,
      accuracy
    };
    
    try {
      // Get existing stats from localStorage
      const existingStatsString = localStorage.getItem("typing_stats");
      const existingStats = existingStatsString 
        ? JSON.parse(existingStatsString) 
        : [];
      
      // Add new stat and save
      const updatedStats = [...existingStats, newStat].slice(-10); // Keep only last 10 sessions
      localStorage.setItem("typing_stats", JSON.stringify(updatedStats));
      
      setSavedStats(updatedStats);
    } catch (error) {
      console.error("Failed to save stats to localStorage:", error);
    }
  }, [wpm, accuracy]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Your Performance</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-1">Speed</span>
          <span className="text-3xl font-bold">{wpm}</span>
          <span className="text-gray-500 text-sm">WPM</span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-1">Accuracy</span>
          <span className="text-3xl font-bold">{accuracy}</span>
          <span className="text-gray-500 text-sm">%</span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-1">Time</span>
          <span className="text-3xl font-bold">{formatTime(timeElapsed)}</span>
          <span className="text-gray-500 text-sm">minutes</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Detailed Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Characters:</span>
              <span>{totalCharacters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Characters Typed:</span>
              <span>{typedCharacters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Errors:</span>
              <span>{errors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion:</span>
              <span>{Math.round((typedCharacters / totalCharacters) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Raw Speed:</span>
              <span>{Math.round((typedCharacters / 5) / (timeElapsed / 60))} WPM</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Recent History</h3>
          {savedStats.length > 0 ? (
            <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {savedStats.slice().reverse().map((stat, index) => (
                <div key={index} className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">
                    {new Date(stat.date).toLocaleDateString()} - {new Date(stat.date).toLocaleTimeString()}
                  </span>
                  <span>{stat.wpm} WPM ({stat.accuracy}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No previous sessions found.</p>
          )}
        </div>
      </div>
    </div>
  );
} 