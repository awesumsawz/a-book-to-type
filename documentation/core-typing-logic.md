### [2024-08-23] Session Update: Core Typing Logic Implementation

**Summary:**
- Enhanced `TypingArea.tsx` to handle core typing mechanics.
- Implemented state management for `currentIndex`, `typedCharsStatus`, `startTime`, `errors`, and `totalTyped`.
- Added a global `keydown` event listener to capture user input (printable characters and backspace).
- Characters are now visually represented with status (correct, incorrect, untyped) using a dedicated `CharSpan` component.
- A blinking caret is implemented and positioned based on the `currentIndex`.
- Automatic scrolling logic keeps the caret/current line centered within the `TypingArea`.
- Progress metrics (errors, total typed, time elapsed) are calculated and sent to the parent `Home` component via the `onProgressUpdate` callback.
- The `Home` component now calculates and displays live WPM and Accuracy based on the received progress.
- Implemented a reset mechanism (`triggerReset` prop and `onResetComplete` callback) to reset typing state when new text is loaded.

**Key Decisions:**
- Use `React.memo` for `CharSpan` for potential performance optimization.
- Use `useCallback` for `handleKeyDown` to prevent unnecessary re-creation.
- Use `refs` (`charRefs`, `caretRef`, `containerRef`) for DOM interactions like caret positioning and scrolling.
- Calculate WPM based on the standard 5 characters per word.
- Provide visual feedback for incorrect characters (red color, underline).
- Render spaces as non-breaking spaces (`\u00A0`) to ensure they are visually represented.
- Use a window event listener for keydown to capture input globally when the component is mounted.
- Calculate metrics in the parent (`Home`) component based on raw data from `TypingArea`.

**Next Steps:**
- Implement session persistence (saving progress when the user leaves/returns).
- Add PDF/OCR handling for file uploads.
- Refine UI/UX aspects (e.g., end-of-test summary, smoother caret animation, better error handling). 