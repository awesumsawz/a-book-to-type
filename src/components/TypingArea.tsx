'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CharSpanProps {
  char: string;
  status: 'correct' | 'incorrect' | 'untyped';
}

// Small component for rendering individual characters with status styling
const CharSpan: React.FC<CharSpanProps> = React.memo(({ char, status }) => {
  let colorClass = 'text-muted/80'; // Dim untyped text more
  if (status === 'correct') {
    colorClass = 'text-foreground'; // Use main text color for correct
  } else if (status === 'incorrect') {
    colorClass = 'text-red-500'; // Keep red for errors
    // Optionally remove underline or use different style like background highlight
    // return <span className={`bg-red-500/30 text-red-100`}>{char === ' ' ? '\u00A0' : char}</span>;
    return <span className={`${colorClass} underline decoration-red-500/70 decoration-2 underline-offset-2`}>{char === ' ' ? '\u00A0' : char}</span>;
  }
  const displayChar = char === ' ' ? '\u00A0' : char; 
  return <span className={colorClass}>{displayChar}</span>;
});
CharSpan.displayName = 'CharSpan';

// Export the progress type for use in the parent component
export interface TypingProgress {
    errors: number;
    currentIndex: number;
    totalTyped: number;
    timeElapsed: number; // in seconds
    typedCharsStatus?: Array<'correct' | 'incorrect' | 'untyped'>; // Make optional if not always needed/saved
    startTime?: number | null; // Make optional
}

interface TypingAreaProps {
  textToType: string;
  initialProgress?: TypingProgress | null; // Accept initial state
  onProgressUpdate: (metrics: TypingProgress) => void;
  onResetComplete: () => void; // Callback after state reset
  onComplete: (finalProgress: TypingProgress) => void; // Callback when the test is finished
  triggerReset: number; // Counter to trigger reset from parent
}

const TypingArea: React.FC<TypingAreaProps> = ({ 
  textToType, 
  initialProgress, 
  onProgressUpdate,
  onResetComplete,
  onComplete,
  triggerReset
}) => {
  // Initialize state with initialProgress if provided, otherwise default values
  const [currentIndex, setCurrentIndex] = useState(() => initialProgress?.currentIndex ?? 0);
  const [typedCharsStatus, setTypedCharsStatus] = useState<Array<'correct' | 'incorrect' | 'untyped'>>(
    () => initialProgress?.typedCharsStatus ?? Array(textToType.length).fill('untyped')
  );
  const [startTime, setStartTime] = useState<number | null>(() => initialProgress?.startTime ?? null);
  const [errors, setErrors] = useState(() => initialProgress?.errors ?? 0);
  const [totalTyped, setTotalTyped] = useState(() => initialProgress?.totalTyped ?? 0);
  const [isTyping, setIsTyping] = useState(() => !!initialProgress && (initialProgress?.currentIndex ?? 0) < textToType.length);
  const [isCompleted, setIsCompleted] = useState(() => (initialProgress?.currentIndex ?? 0) >= textToType.length && textToType.length > 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Initialize or reset state when textToType changes or reset is triggered
  useEffect(() => {
    // Only reset fully if not loading initial progress (indicated by trigger)
    if (!initialProgress || triggerReset > 0) {
        setCurrentIndex(0);
        setTypedCharsStatus(Array(textToType.length).fill('untyped'));
        setStartTime(null);
        setErrors(0);
        setTotalTyped(0);
        setIsTyping(false);
        setIsCompleted(false); // Reset completion state
        // Scroll to top
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
    }
    // Ensure charRefs array is the correct size regardless of reset type
    charRefs.current = Array(textToType.length).fill(null);
    // Always call reset complete callback
    onResetComplete(); 
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToType, triggerReset]); // Rerun when text or reset trigger changes

  // Initialize charRefs size on initial load/text change if not reset triggered
   useEffect(() => {
     if (textToType.length > 0 && charRefs.current.length !== textToType.length) {
         charRefs.current = Array(textToType.length).fill(null);
     }
  }, [textToType]);

  // Re-initialize state if initialProgress prop updates AFTER initial mount
  // This might happen if loading state takes time
  useEffect(() => {
     if (initialProgress && triggerReset === 0) { // Only apply if it's the *initial* load progress
         const initialIndex = initialProgress.currentIndex ?? 0;
         setCurrentIndex(initialIndex);
         setTypedCharsStatus(initialProgress.typedCharsStatus ?? Array(textToType.length).fill('untyped'));
         setStartTime(initialProgress.startTime ?? null);
         setErrors(initialProgress.errors ?? 0);
         setTotalTyped(initialProgress.totalTyped ?? 0);
         const completed = initialIndex >= textToType.length && textToType.length > 0;
         setIsCompleted(completed);
         setIsTyping(!!initialProgress && !completed); // Set typing based on loaded state
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProgress]); 


  // Scroll caret into view
  useEffect(() => {
    // Don't scroll if completed
    if (isCompleted) return;
    
    const timer = setTimeout(() => {
        if (caretRef.current && containerRef.current) {
            const caretRect = caretRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            // Check if caret is outside the visible area
            if (
                caretRect.top < containerRect.top + 20 || 
                caretRect.bottom > containerRect.bottom - 20 
            ) {
                caretRef.current.scrollIntoView({
                block: 'center',
                inline: 'nearest',
                behavior: initialProgress ? 'auto' : 'smooth' // Jump instantly on load
                });
            }
        }
    }, initialProgress ? 100 : 0); // Small delay only if loading progress
    
    return () => clearTimeout(timer);

  }, [currentIndex, initialProgress, isCompleted]); // Add isCompleted dependency

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore input if completed or no text
    if (isCompleted || !textToType || currentIndex >= textToType.length) {
      return;
    }

    const { key } = event;
    let currentStartTime = startTime;

    // Start timer on first valid keypress if not already started
    if (!isTyping && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { 
        currentStartTime = Date.now();
        setStartTime(currentStartTime);
        setIsTyping(true);
    }

    if (key === 'Backspace') {
      event.preventDefault();
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1;
        let currentErrors = errors;
        setTypedCharsStatus(prev => {
          const newStatus = [...prev];
          if(newStatus[newIndex] === 'incorrect'){
             currentErrors = Math.max(0, errors - 1);
             setErrors(currentErrors); 
          }
          newStatus[newIndex] = 'untyped';
          return newStatus;
        });
        setCurrentIndex(newIndex);
      }
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const expectedChar = textToType[currentIndex];
      const newIndex = currentIndex + 1;
      let isCorrect = key === expectedChar;
      let currentErrors = errors;

      if (!isCorrect && typedCharsStatus[currentIndex] !== 'incorrect') {
          currentErrors += 1;
          setErrors(currentErrors);
      }

      let newTypedCharsStatus: Array<'correct' | 'incorrect' | 'untyped'> = [];
      setTypedCharsStatus(prev => {
        newTypedCharsStatus = [...prev];
        if(newTypedCharsStatus[currentIndex] === 'incorrect' && isCorrect) {
           currentErrors = Math.max(0, errors - 1);
           setErrors(currentErrors); 
        }
        newTypedCharsStatus[currentIndex] = isCorrect ? 'correct' : 'incorrect';
        return newTypedCharsStatus;
      });

      const currentTotalTyped = totalTyped + 1; 
      setTotalTyped(currentTotalTyped);
      setCurrentIndex(newIndex);
      
      let finalProgress: TypingProgress | null = null; 
      // Send progress update only if typing has started
      if (currentStartTime) {
          const timeElapsed = (Date.now() - currentStartTime) / 1000; 
          const currentProgress: TypingProgress = {
             errors: currentErrors, 
             currentIndex: newIndex,
             totalTyped: currentTotalTyped,
             timeElapsed: timeElapsed,
             typedCharsStatus: newTypedCharsStatus, // Include status for saving
             startTime: currentStartTime // Include startTime for saving
          };
          onProgressUpdate(currentProgress);
          finalProgress = currentProgress; // Store for onComplete
      }

      // Check for completion
      if (newIndex === textToType.length) {
          setIsTyping(false);
          setIsCompleted(true);
          if (finalProgress) { // Ensure we have progress data to send
              onComplete(finalProgress); // Call the completion callback WITH FINAL PROGRESS
          } else {
              // Handle edge case where completion happens before first progress update (unlikely)
              onComplete({
                  errors: currentErrors,
                  currentIndex: newIndex,
                  totalTyped: currentTotalTyped,
                  timeElapsed: 0, // Or calculate if possible
                  typedCharsStatus: newTypedCharsStatus,
                  startTime: currentStartTime
              });
          }
      }
    }

  }, [currentIndex, textToType, isTyping, errors, totalTyped, onProgressUpdate, startTime, typedCharsStatus, isCompleted, onComplete]); // Added dependencies

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getCaretLeftPosition = (index: number): number | string => {
      if (index === 0) return 0; 
      // Ensure refs array is populated before accessing
      if (index > charRefs.current.length) return 'auto';
      const charRef = charRefs.current[index - 1];
      if(charRef) {
         return charRef.offsetLeft + charRef.offsetWidth;
      }
      return 'auto'; 
  };

   const getCaretTopPosition = (index: number): number => {
      // Ensure refs array is populated
      if (index >= charRefs.current.length && index > 0) {
          // If at the end, use the previous character's top position
          return charRefs.current[index - 1]?.offsetTop ?? 0;
      } 
      return charRefs.current[index]?.offsetTop ?? 0;
   };

  return (
    <section
      ref={containerRef}
      // Increased height, larger font, adjusted line height, softer focus ring
      className={`h-80 bg-dimmed rounded-lg p-5 border border-muted overflow-y-auto relative font-mono text-xl sm:text-2xl leading-relaxed sm:leading-loose focus:outline-none focus:ring-1 focus:ring-primary/50 ${isCompleted ? 'cursor-default' : 'cursor-text'}`}
      tabIndex={0} 
      onClick={() => {!isCompleted && containerRef.current?.focus()}} 
    >
      {textToType ? (
        // Relative positioning context for caret and overlay
        <div className="relative whitespace-pre-wrap break-words select-none">
           {/* Caret - Slimmer, slightly different pulse */} 
           {!isCompleted && currentIndex <= textToType.length && textToType.length > 0 && ( 
             <span
               ref={caretRef}
               // Use theme color, adjust size, smoother animation
               className="absolute bg-primary w-[2px] h-7 sm:h-8 animate-caret-pulse z-10"
               style={{ 
                 left: getCaretLeftPosition(currentIndex),
                 top: getCaretTopPosition(currentIndex) 
               }}
             ></span>
           )}
           
           {/* Text Characters */} 
           {textToType.split('').map((char, index) => (
             <span 
               key={index} 
               ref={el => { charRefs.current[index] = el; }} 
             >
               {/* Use text-foreground for correct, theme-specific red/error color */} 
               <CharSpan char={char} status={typedCharsStatus[index] || 'untyped'} />
             </span>
           ))}

            {/* Completion Message Overlay - Softer background */}
            {isCompleted && (
                <div className="absolute inset-0 bg-background/95 flex justify-center items-center z-20 rounded-md">
                    <p className="text-xl sm:text-2xl font-bold text-green-400">Test Completed!</p>
                </div>
            )}
         </div>
      ) : (
        // Centered placeholder text
        <p className="text-muted text-center text-base sm:text-lg absolute inset-0 flex items-center justify-center">
            Upload a file or paste text to begin.
        </p>
      )}
    </section>
  );
};

export default TypingArea; 