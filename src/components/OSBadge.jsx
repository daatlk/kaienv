import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  faLinux,
  faWindows,
  faApple
} from '@fortawesome/free-brands-svg-icons';
import { faServer, faCopy } from '@fortawesome/free-solid-svg-icons';

/**
 * OSBadge component - Displays an operating system badge with appropriate icon and styling
 *
 * @param {string} os - The operating system name (Linux, Windows, macOS, Unix, Other)
 * @param {string} osVersion - The operating system version
 * @returns {JSX.Element} - Styled badge with OS icon and name
 */
const OSBadge = ({ os, osVersion }) => {
  const [copied, setCopied] = useState(false);

  // Default to Linux if no OS is provided
  const osType = os || 'Linux';

  // Normalize OS name to lowercase for class and comparison
  const osLower = osType.toLowerCase();

  // Determine which icon to use based on OS
  const getOSIcon = () => {
    switch (osLower) {
      case 'linux':
        return faLinux;
      case 'windows':
        return faWindows;
      case 'macos':
        return faApple;
      case 'unix':
        return faServer;
      default:
        return faServer;
    }
  };

  // Create tooltip text with version if available
  const tooltipText = osVersion ? `${osType} ${osVersion}` : osType;

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tooltipText);
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
    <Tooltip id="os-tooltip" {...props}>
      {copied ? "Copied!" : tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <span
        className={`os-badge ${osLower}`}
        onClick={handleCopy}
        style={{ cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={copied ? faCopy : getOSIcon()} />
      </span>
    </OverlayTrigger>
  );
};

export default OSBadge;
