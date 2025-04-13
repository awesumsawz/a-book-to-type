'use client';

import React, { useState, useCallback, useEffect } from 'react';
import InputArea from '@/components/InputArea';
import TypingArea, { TypingProgress } from '@/components/TypingArea';
import MetricsDisplay from '@/components/MetricsDisplay';
import { Toaster } from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'typingAppState';

interface TypingMetrics {
    wpm: number;
    accuracy: number;
    errors: number;
    finalTime?: number;
}

interface SavedState {
    text: string;
    progress: TypingProgress;
}

export default function Home() {
  const [textToType, setTextToType] = useState<string>('');
  const [metrics, setMetrics] = useState<TypingMetrics | null>(null);
  const [initialProgress, setInitialProgress] = useState<TypingProgress | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateString) {
        const savedState: SavedState = JSON.parse(savedStateString);
        if (savedState && savedState.text && savedState.progress && savedState.progress.currentIndex < savedState.text.length) {
          console.log('Loading saved state:', savedState);
          setTextToType(savedState.text);
          setInitialProgress(savedState.progress);
          handleProgressUpdate(savedState.progress, false);
          setIsComplete(false);
        } else if (savedState?.text) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load or parse saved state:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsLoaded(true);
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    console.log('New text loaded, clearing saved state.');
    setTextToType(newText);
    setMetrics(null);
    setInitialProgress(null);
    setIsComplete(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setResetTrigger(prev => prev + 1);
  }, []);

  const handleProgressUpdate = useCallback((progress: TypingProgress, shouldSave: boolean = true) => {
    let wpm = 0;
    let accuracy = 100;

    if (progress.timeElapsed > 0 && progress.totalTyped > 0) {
      const wordsTyped = progress.totalTyped / 5;
      const minutesElapsed = progress.timeElapsed / 60;
      wpm = Math.round(wordsTyped / minutesElapsed);
      accuracy = Math.round(((progress.totalTyped - progress.errors) / progress.totalTyped) * 100);
      wpm = isNaN(wpm) || !isFinite(wpm) ? 0 : wpm;
      accuracy = isNaN(accuracy) || !isFinite(accuracy) ? 0 : accuracy;
    } else {
       accuracy = progress.totalTyped > 0 ? Math.round(((progress.totalTyped - progress.errors) / progress.totalTyped) * 100) : 100;
       accuracy = isNaN(accuracy) || !isFinite(accuracy) ? 100 : accuracy;
    }

    setMetrics(prevMetrics => ({
      wpm: wpm,
      accuracy: accuracy,
      errors: progress.errors,
      finalTime: prevMetrics?.finalTime 
    }));

    if (shouldSave && textToType && isLoaded && progress.currentIndex < textToType.length) {
        try {
            const stateToSave: SavedState = { text: textToType, progress };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }
  }, [textToType, isLoaded]);

  const handleResetComplete = useCallback(() => {
    console.log("Typing area reset complete.");
    setMetrics(null);
  }, []);

  const handleTestComplete = useCallback((finalProgress: TypingProgress) => {
      console.log("Test Completed! Final Progress:", finalProgress);
      setIsComplete(true);
      setMetrics(prevMetrics => ({
          ...(prevMetrics ?? { wpm: 0, accuracy: 0, errors: 0 }),
          errors: finalProgress.errors,
          finalTime: finalProgress.timeElapsed
      }));
      localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const handleManualReset = useCallback(() => {
     console.log("Manual reset triggered.");
     setMetrics(null);
     setInitialProgress(null);
     setIsComplete(false);
     localStorage.removeItem(LOCAL_STORAGE_KEY);
     setResetTrigger(prev => prev + 1);
  }, []);

  if (!isLoaded) {
     return (
       <div className="flex justify-center items-center min-h-screen bg-background text-foreground font-sans">
         Loading...
       </div>
     );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background text-foreground font-sans">
      <Toaster 
        position="bottom-center"
        toastOptions={{
            className: '',
            duration: 5000,
            style: {
                background: 'var(--dimmed)',
                color: 'var(--foreground)',
                border: '1px solid var(--muted)'
            },
            success: {
                duration: 3000,
            },
            error: {
                duration: 5000,
            }
        }}
      />
      <header className="w-full max-w-3xl mb-6 sm:mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">A Book To Type</h1>
      </header>

      <main className="w-full max-w-3xl flex flex-col gap-6 sm:gap-8">
        <InputArea onTextChange={handleTextChange} />
        {textToType && (
            <TypingArea
               textToType={textToType}
               initialProgress={initialProgress}
               onProgressUpdate={handleProgressUpdate}
               onResetComplete={handleResetComplete}
               onComplete={handleTestComplete}
               triggerReset={resetTrigger}
            />
        )}
        {textToType && (
            <MetricsDisplay
               wpm={metrics?.wpm}
               accuracy={metrics?.accuracy}
               errors={metrics?.errors}
               finalTime={metrics?.finalTime}
               isComplete={isComplete}
            />
        )}
        {textToType && !isComplete && (
            <div className="flex justify-center mt-[-0.5rem] sm:mt-[-1rem] mb-4">
                <button 
                    onClick={handleManualReset}
                    className="px-5 py-1.5 sm:px-6 sm:py-2 bg-primary text-background font-semibold rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors disabled:opacity-50 text-sm sm:text-base"
                    disabled={!textToType}
                >
                    Reset Test
                </button>
            </div>
        )}
        {isComplete && (
            <div className="flex justify-center mt-[-0.5rem] sm:mt-[-1rem] mb-4">
                <button 
                    onClick={() => handleTextChange('')}
                    className="px-5 py-1.5 sm:px-6 sm:py-2 bg-muted text-foreground font-semibold rounded-full hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-muted transition-colors text-sm sm:text-base"
                >
                    Type New Text
                </button>
            </div>
        )}
      </main>

      <footer className="w-full max-w-3xl mt-10 sm:mt-16 text-center text-xs text-muted/70">
        <p>Created with ❤️</p>
      </footer>
    </div>
  );
}
