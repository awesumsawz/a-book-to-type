'use client';

import React from 'react';

// TODO: Define more specific props as metrics calculation is implemented
interface MetricsDisplayProps {
  wpm?: number | string; // Allow string for default '--'
  accuracy?: number | string;
  errors?: number | string;
  finalTime?: number; // Add final time prop
  isComplete?: boolean; // Add completion status prop
}

// Helper to format time (seconds) into MM:SS
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ 
  wpm = '--', 
  accuracy = '--', 
  errors = '--', 
  finalTime,
  isComplete = false
}) => {
  return (
    // Reduced padding, slightly larger text
    <section className="flex justify-around items-baseline p-3 bg-dimmed rounded-lg border border-muted">
      {/* WPM */} 
      <div className="text-center">
        <span className="text-xs sm:text-sm font-medium text-muted uppercase tracking-wider">WPM</span>
        <p className="text-2xl sm:text-3xl font-bold text-primary">{wpm}</p>
      </div>
      {/* Accuracy */} 
      <div className="text-center">
        <span className="text-xs sm:text-sm font-medium text-muted uppercase tracking-wider">Accuracy</span>
        <p className="text-2xl sm:text-3xl font-bold text-primary">{accuracy}{typeof accuracy === 'number' ? '%' : ''}</p>
      </div>
      {/* Errors */} 
      <div className="text-center">
        <span className="text-xs sm:text-sm font-medium text-muted uppercase tracking-wider">Errors</span>
        <p className="text-2xl sm:text-3xl font-bold text-primary">{errors}</p>
      </div>
      {/* Final Time */} 
      {isComplete && finalTime !== undefined && (
          <div className="text-center">
            <span className="text-xs sm:text-sm font-medium text-muted uppercase tracking-wider">Time</span>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{formatTime(finalTime)}</p>
          </div>
      )}
    </section>
  );
};

export default MetricsDisplay; 