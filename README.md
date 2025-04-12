# A Book to Type

A modern typing practice and speed measurement application designed to help users improve their typing skills while engaging with meaningful text content.

## Features

- **File Upload**: Upload PDF documents and text files to practice typing with content that matters to you
- **Text Processing**: Extracts text from PDFs (using both direct extraction and OCR for image-based content)
- **Typing Practice Interface**: Interactive typing interface with real-time feedback and error highlighting 
- **Performance Tracking**: Monitors typing speed (WPM), accuracy, and detailed metrics
- **Progress Saving**: Automatically saves your progress so you can resume your practice sessions

## Technologies Used

- Next.js 15.3.0 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- TurboPack
- Libraries:
  - pdf-parse: For PDF text extraction
  - react-dropzone: For file upload handling
  - tesseract.js: For OCR capability
  - @heroicons/react: For UI icons
  - zustand: For state management

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd a-book-to-type
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload a Document**: Click "Upload Document" on the homepage to upload a PDF or text file.
2. **Practice Typing**: After uploading, you can start typing practice with your document.
3. **View Metrics**: Monitor your typing performance with real-time metrics.
4. **Resume Later**: Your progress is automatically saved, allowing you to resume from where you left off.

## Project Structure

```
a-book-to-type/
├── documentation/      # Project documentation
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages
│   ├── components/     # React components
│   │   ├── FileUpload/        # File upload components
│   │   ├── TypingInterface/   # Typing interface components
│   │   └── UserMetrics/       # Performance metrics components
│   └── lib/            # Utilities and services
│       ├── services/   # Application services
│       └── utils/      # Helper utilities
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Future Enhancements

- User accounts for saving progress across devices
- Enhanced OCR capabilities for better PDF processing
- Support for more document formats (DOCX, EPUB, etc.)
- Custom typing lessons and exercises
- Keyboard heatmaps for visualizing error patterns
- Competitive typing mode for multiple users

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Next.js team for the excellent framework
- PDF.js and Tesseract.js for text extraction capabilities
