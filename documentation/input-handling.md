### [2024-08-23] Session Update: Input Handling Implementation

**Summary:**
- Created component files: `InputArea.tsx`, `TypingArea.tsx`, `MetricsDisplay.tsx`.
- Implemented the `InputArea` component to handle text file (.txt) uploads and direct text pasting.
- Added basic placeholder structures for `TypingArea` and `MetricsDisplay`.
- Updated the main `Home` component (`page.tsx`) to integrate these components and manage the input text state.
- The application can now accept text input via file upload or pasting, and displays it in the designated area.

**Key Decisions:**
- Separate components for distinct functionalities (Input, Typing, Metrics) for better organization.
- Use `useState` in the `Home` component to manage the shared text state.
- Prioritize `.txt` file handling initially; PDF processing deferred.
- Use standard browser `FileReader` API for text file reading.
- `InputArea` clears the alternative input method (file vs. paste) when one is used.

**Next Steps:**
- Implement the core typing logic within the `TypingArea` component.
- Develop the visual representation of typed text (correct, incorrect characters) and the caret.
- Implement the automatic scrolling logic for the typing area. 