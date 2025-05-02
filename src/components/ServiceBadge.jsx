import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faCloud,
  faCogs,
  faExchangeAlt,
  faServer,
  faGlobe,
  faCode,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';

/**
 * ServiceBadge component - Displays a service badge with appropriate icon and styling
 *
 * @param {string} name - The service name
 * @returns {JSX.Element} - Styled badge with service icon and name
 */
const ServiceBadge = ({ name }) => {
  // Get service type for styling
  const getServiceType = () => {
    const serviceName = name.toLowerCase();

    if (serviceName.includes('db') || serviceName.includes('database') || serviceName.includes('sql')) {
      return 'db';
    } else if (serviceName.includes('web') || serviceName.includes('http') || serviceName.includes('site')) {
      return 'web';
    } else if (serviceName.includes('app') || serviceName.includes('application')) {
      return 'app';
    } else if (serviceName.includes('management') || serviceName.includes('admin') || serviceName.includes('control')) {
      return 'management';
    } else {
      return '';
    }
  };

  // Get icon based on service name
  const getServiceIcon = () => {
    const serviceName = name.toLowerCase();

    if (serviceName.includes('db') || serviceName.includes('database') || serviceName.includes('sql')) {
      return faDatabase;
    } else if (serviceName.includes('cloud')) {
      return faCloud;
    } else if (serviceName.includes('management') || serviceName.includes('admin')) {
      return faCogs;
    } else if (serviceName.includes('migration') || serviceName.includes('transfer')) {
      return faExchangeAlt;
    } else if (serviceName.includes('web') || serviceName.includes('http')) {
      return faGlobe;
    } else if (serviceName.includes('app') || serviceName.includes('application')) {
      return faCode;
    } else if (serviceName.includes('network')) {
      return faNetworkWired;
    } else {
      return faServer;
    }
  };

  return (
    <span className={`service-badge ${getServiceType()}`} title={name}>
      <FontAwesomeIcon icon={getServiceIcon()} />
      <span className="service-name">{name}</span>
    </span>
  );
};

export default ServiceBadge;
