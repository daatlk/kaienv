import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer } from '@fortawesome/free-solid-svg-icons';

const Logo = ({ size = 'md', color = 'primary' }) => {
  // Size classes
  const sizeClass = size === 'sm' ? 'fs-5' :
                   size === 'lg' ? 'fs-1' :
                   'fs-3';

  // Color classes - using inline style for more control
  const colorStyle = {
    color: color === 'primary' ? '#0070ba' :
           color === 'secondary' ? '#ff4081' :
           color === 'dark' ? '#343a40' :
           '#0070ba'
  };

  return (
    <div className="logo-container d-flex align-items-center">
      <FontAwesomeIcon
        icon={faServer}
        className={`me-2 ${sizeClass}`}
        style={colorStyle}
      />
      <span
        className={`logo-text fw-bold ${sizeClass}`}
        style={colorStyle}
      >
        VM Dashboard
      </span>
    </div>
  );
};

export default Logo;
