import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLinux, 
  faWindows, 
  faApple 
} from '@fortawesome/free-brands-svg-icons';
import { faServer } from '@fortawesome/free-solid-svg-icons';

/**
 * OSBadge component - Displays an operating system badge with appropriate icon and styling
 * 
 * @param {string} os - The operating system name (Linux, Windows, macOS, Unix, Other)
 * @returns {JSX.Element} - Styled badge with OS icon and name
 */
const OSBadge = ({ os }) => {
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
  
  return (
    <span className={`os-badge ${osLower}`}>
      <FontAwesomeIcon icon={getOSIcon()} className="me-1" />
      {osType}
    </span>
  );
};

export default OSBadge;
