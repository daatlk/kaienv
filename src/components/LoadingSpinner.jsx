import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

// LoadingSpinner component with different size and container options
const LoadingSpinner = ({ 
  size = 'md', 
  containerClass = '', 
  fullPage = false,
  text = 'Loading...',
  variant = 'primary'
}) => {
  // Determine spinner size
  const spinnerSize = size === 'sm' ? '' : (size === 'lg' ? 'spinner-border-lg' : '');
  
  // If fullPage is true, center the spinner in the page
  if (fullPage) {
    return (
      <Container 
        className="d-flex flex-column justify-content-center align-items-center" 
        style={{ minHeight: '60vh' }}
      >
        <Spinner 
          animation="border" 
          role="status" 
          variant={variant}
          className={spinnerSize}
        />
        {text && <p className="mt-3 text-muted">{text}</p>}
      </Container>
    );
  }
  
  // Regular spinner with optional container
  return (
    <div className={`d-flex align-items-center ${containerClass}`}>
      <Spinner 
        animation="border" 
        role="status" 
        variant={variant}
        className={spinnerSize}
      />
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
