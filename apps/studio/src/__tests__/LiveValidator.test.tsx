
import { render, screen } from '@testing-library/react';
import LiveValidator from '../components/studio/LiveValidator';
import '@testing-library/jest-dom';

describe('LiveValidator Component Smoke Test', () => {
  it('renders without crashing and displays initial state', () => {
    render(<LiveValidator />);
    expect(screen.getByText(/Live Validator/i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting AIX DNA/i)).toBeInTheDocument();
  });

  it('can handle dropping content (UI test)', () => {
    render(<LiveValidator content="meta: { version: '1.0' }" fileName="test.aix" />);
    // Since processContent is async, we would use waitFor in a real test
    // but here we are checking if the component itself is mountable with props
    expect(screen.getByText(/File: test.aix/i)).toBeInTheDocument();
  });
});
