import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the initial entry modal', () => {
    render(<App />);

    // using screen.getByText to find an element with the given text content
    const welcomeText = screen.getByText(/Join or Create a Room/i);

    // Assert that the element was found in the document
    expect(welcomeText).toBeInTheDocument();
  });
});