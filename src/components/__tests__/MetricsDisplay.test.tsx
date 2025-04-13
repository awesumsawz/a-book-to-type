import React from 'react';
import { render, screen, within } from '@testing-library/react';
import MetricsDisplay from '../MetricsDisplay';
import '@testing-library/jest-dom';

describe('MetricsDisplay Component', () => {
  test('renders default placeholders', () => {
    render(<MetricsDisplay />);
    // screen.debug(); // Uncomment to see output

    // Use more robust queries, checking within specific divs if necessary
    const wpmSection = screen.getByText(/WPM/i).closest('div');
    expect(wpmSection).toBeInTheDocument();
    expect(within(wpmSection!).getByText('--')).toBeInTheDocument();

    const accuracySection = screen.getByText(/Accuracy/i).closest('div');
    expect(accuracySection).toBeInTheDocument();
    // Default accuracy is rendered as '--' in the component, not '--%'
    expect(within(accuracySection!).getByText('--')).toBeInTheDocument(); 

    const errorsSection = screen.getByText(/Errors/i).closest('div');
    expect(errorsSection).toBeInTheDocument();
    expect(within(errorsSection!).getByText('--')).toBeInTheDocument(); 

    expect(screen.queryByText(/Time/i)).not.toBeInTheDocument();
  });

  test('renders provided metrics', () => {
    render(<MetricsDisplay wpm={85} accuracy={95} errors={3} />);
    // screen.debug();
    
    const wpmSection = screen.getByText(/WPM/i).closest('div');
    expect(within(wpmSection!).getByText('85')).toBeInTheDocument();

    const accuracySection = screen.getByText(/Accuracy/i).closest('div');
    expect(within(accuracySection!).getByText('95%')).toBeInTheDocument();

    const errorsSection = screen.getByText(/Errors/i).closest('div');
    expect(within(errorsSection!).getByText('3')).toBeInTheDocument();

    expect(screen.queryByText(/Time/i)).not.toBeInTheDocument();
  });

  test('renders final time when isComplete is true', () => {
    render(<MetricsDisplay wpm={85} accuracy={95} errors={3} finalTime={125} isComplete={true} />);
    // screen.debug();

    expect(screen.getByText(/WPM/i)).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Accuracy/i)).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText(/Errors/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    const timeSection = screen.getByText(/Time/i).closest('div');
    expect(within(timeSection!).getByText('2:05')).toBeInTheDocument(); 
  });

   test('handles zero values correctly', () => {
    render(<MetricsDisplay wpm={0} accuracy={0} errors={0} />);
    // screen.debug();

    const wpmSection = screen.getByText(/WPM/i).closest('div');
    // Need to find the specific '0' within the WPM section
    expect(within(wpmSection!).getByText((content, node) => node?.tagName.toLowerCase() === 'p' && content === '0')).toBeInTheDocument();

    const accuracySection = screen.getByText(/Accuracy/i).closest('div');
    expect(within(accuracySection!).getByText('0%')).toBeInTheDocument();

    const errorsSection = screen.getByText(/Errors/i).closest('div');
    expect(within(errorsSection!).getByText((content, node) => node?.tagName.toLowerCase() === 'p' && content === '0')).toBeInTheDocument();
  });
}); 