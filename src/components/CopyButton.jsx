import React, { useState } from 'react';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

/**
 * CopyButton component - A button that copies text to clipboard
 * 
 * @param {string} text - The text to copy
 * @param {string} variant - Button variant (default: 'outline-secondary')
 * @param {string} size - Button size (default: 'sm')
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element} - Copy button with success feedback
 */
const CopyButton = ({ 
  text, 
  variant = 'outline-secondary', 
  size = 'sm',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const renderTooltip = (props) => (
    <Tooltip id="copy-tooltip" {...props}>
      {copied ? 'Copied!' : 'Copy to clipboard'}
    </Tooltip>
  );
  
  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 400, hide: 100 }}
      overlay={renderTooltip}
    >
      <Button 
        variant={variant} 
        size={size}
        onClick={handleCopy}
        className={`copy-button ${className} ${copied ? 'copied' : ''}`}
        aria-label="Copy to clipboard"
      >
        <FontAwesomeIcon 
          icon={copied ? faCheck : faCopy} 
          className={copied ? 'text-success' : ''}
        />
      </Button>
    </OverlayTrigger>
  );
};

export default CopyButton;
