import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import TypingArea from '../TypingArea';
import '@testing-library/jest-dom';

// Mock IntersectionObserver used internally by scrollIntoView({ block: 'center' })
// A basic mock is usually sufficient
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(() => []),
}));

describe('TypingArea Component', () => {
  const mockOnProgressUpdate = jest.fn();
  const mockOnResetComplete = jest.fn();
  const mockOnComplete = jest.fn();
  const testText = "Hello world";

  beforeEach(() => {
    mockOnProgressUpdate.mockClear();
    mockOnResetComplete.mockClear();
    mockOnComplete.mockClear();
    // Reset window listeners if necessary (though handleKeyDown uses useCallback)
    // jest.clearAllMocks(); // Use carefully
  });

  test('renders placeholder when no text is provided', () => {
    render(
      <TypingArea
        textToType=""
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0}
      />
    );
    expect(screen.getByText(/Upload a file or paste text to begin./i)).toBeInTheDocument();
  });

  test('renders text to type correctly', () => {
    render(
      <TypingArea
        textToType={testText}
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0}
      />
    );
    // Check if all characters are rendered (initially as untyped)
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('e')).toBeInTheDocument();
    expect(screen.getByText('l', { exact: false })).toBeInTheDocument(); // Might be multiple 'l's
    expect(screen.getByText('o')).toBeInTheDocument();
    expect(screen.getByText('w')).toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
    expect(screen.getByText('d')).toBeInTheDocument();
    // Check for the space (rendered as non-breaking space)
    expect(screen.getByText('\u00A0')).toBeInTheDocument(); 
    expect(mockOnResetComplete).toHaveBeenCalledTimes(1); // Initial reset
  });

  test('handles correct key press', async () => {
    render(
      <TypingArea
        textToType={testText} // "Hello world"
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0}
      />
    );

    // No need for outer act here, fireEvent is usually sufficient
    fireEvent.keyDown(window, { key: 'H', code: 'KeyH' });
    
    // Wait for the progress update callback to be called
    await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1);
    });

    const progressArgs = mockOnProgressUpdate.mock.calls[0][0];
    expect(progressArgs.currentIndex).toBe(1);
    expect(progressArgs.errors).toBe(0);
    expect(progressArgs.totalTyped).toBe(1);
  });

   test('handles incorrect key press', async () => {
    render(
      <TypingArea
        textToType={testText} // "Hello world"
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0}
      />
    );
    
    fireEvent.keyDown(window, { key: 'X', code: 'KeyX' });

    await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1);
    });

    const progressArgs = mockOnProgressUpdate.mock.calls[0][0];
    expect(progressArgs.currentIndex).toBe(1);
    expect(progressArgs.errors).toBe(1);
    expect(progressArgs.totalTyped).toBe(1);
  });

   test('handles backspace key press', async () => {
    render(
      <TypingArea
        textToType={testText} // "Hello world"
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0}
      />
    );
    
    // Type 'H' correctly first
    fireEvent.keyDown(window, { key: 'H', code: 'KeyH' });
    await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1);
    });
    expect(mockOnProgressUpdate.mock.calls[0][0].currentIndex).toBe(1);
    mockOnProgressUpdate.mockClear(); 

    // Simulate Backspace - should not trigger progress update
    fireEvent.keyDown(window, { key: 'Backspace', code: 'Backspace' });

    // Wait a tick to ensure no update happens (can be tricky)
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(mockOnProgressUpdate).not.toHaveBeenCalled();
  });

  test('calls onComplete when text is fully typed', async () => {
      render(
        <TypingArea
          textToType="Hi" // Short text
          onProgressUpdate={mockOnProgressUpdate}
          onResetComplete={mockOnResetComplete}
          onComplete={mockOnComplete}
          triggerReset={0}
        />
      );
  
      fireEvent.keyDown(window, { key: 'H', code: 'KeyH' });
      // Wait for first update
      await waitFor(() => expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1));
      expect(mockOnComplete).not.toHaveBeenCalled();
      
      fireEvent.keyDown(window, { key: 'i', code: 'KeyI' });
      // Wait for the complete callback
      await waitFor(() => {
          expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
      
      expect(mockOnComplete).toHaveBeenCalledWith(expect.objectContaining({
          currentIndex: 2,
          errors: 0,
          totalTyped: 2,
      }));
  });

   test('calls onResetComplete when triggerReset prop changes', async () => {
    const { rerender } = render(
      <TypingArea
        textToType={testText}
        onProgressUpdate={mockOnProgressUpdate}
        onResetComplete={mockOnResetComplete}
        onComplete={mockOnComplete}
        triggerReset={0} // Initial value
      />
    );
    // Wait for initial reset complete if needed (might be sync)
    await waitFor(() => expect(mockOnResetComplete).toHaveBeenCalledTimes(1));

    // Rerender should trigger the effect and callback
    rerender(
         <TypingArea
          textToType={testText}
          onProgressUpdate={mockOnProgressUpdate}
          onResetComplete={mockOnResetComplete}
          onComplete={mockOnComplete}
          triggerReset={1} // Changed value
        />
    );
    
    // Wait for the second call
    await waitFor(() => expect(mockOnResetComplete).toHaveBeenCalledTimes(2));
  });

}); 