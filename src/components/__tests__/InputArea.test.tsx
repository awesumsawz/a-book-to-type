import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputArea from '../InputArea';
import '@testing-library/jest-dom';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock Tesseract.js - prevent actual worker loading
jest.mock('tesseract.js', () => ({
  __esModule: true,
  createWorker: jest.fn().mockResolvedValue({
    recognize: jest.fn().mockResolvedValue({ data: { text: 'mock ocr result' } }),
    terminate: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock pdfjs-dist - prevent actual worker loading and provide dummy data
jest.mock('pdfjs-dist', () => ({
    __esModule: true,
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: jest.fn().mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: jest.fn().mockResolvedValue({
          getTextContent: jest.fn().mockResolvedValue({
            items: [{ str: 'mock' }, { str: 'pdf' }, { str: 'text' }],
          }),
        }),
      }),
    }),
}));

describe('InputArea Component', () => {
  const mockOnTextChange = jest.fn();

  beforeEach(() => {
    mockOnTextChange.mockClear();
    // Clear mocks for toast if needed
    require('react-hot-toast').toast.success.mockClear();
    require('react-hot-toast').toast.error.mockClear();
    require('react-hot-toast').toast.loading.mockClear();
  });

  test('renders input fields and labels', () => {
    render(<InputArea onTextChange={mockOnTextChange} />);
    expect(screen.getByLabelText(/Upload File/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Paste Text/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste your text here.../i)).toBeInTheDocument();
  });

  test('calls onTextChange when pasting text', () => {
    render(<InputArea onTextChange={mockOnTextChange} />);
    const textarea = screen.getByPlaceholderText(/Paste your text here.../i);
    fireEvent.change(textarea, { target: { value: 'Pasted content' } });
    expect(textarea).toHaveValue('Pasted content');
    expect(mockOnTextChange).toHaveBeenCalledTimes(1);
    expect(mockOnTextChange).toHaveBeenCalledWith('Pasted content');
  });

  // Basic test for file input - more detailed tests require mocking FileReader etc.
  test('file input exists and accepts correct types', () => {
      render(<InputArea onTextChange={mockOnTextChange} />);
      const fileInput = screen.getByLabelText(/Upload File/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.pdf,.txt,image/png,image/jpeg,image/webp,image/bmp');
  });

  // TODO: Add tests for file upload scenarios (TXT, PDF, Image) 
  // These would require more involved mocking of FileReader, pdfjs, tesseract
  // For example, a basic TXT file test:
  // test('handles TXT file upload', async () => {
  //   render(<InputArea onTextChange={mockOnTextChange} />);
  //   const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
  //   const fileInput = screen.getByLabelText(/Upload File/i);
  //   await act(async () => {
  //      fireEvent.change(fileInput, { target: { files: [file] } });
  //   })
       // Need to mock FileReader properly here to test the result
  //   // expect(mockOnTextChange).toHaveBeenCalledWith('test content');
  // });

}); 