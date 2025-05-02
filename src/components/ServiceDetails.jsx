import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OSBadge from './OSBadge';
import CopyButton from './CopyButton';
import {
  faDatabase,
  faCloud,
  faCogs,
  faExchangeAlt,
  faServer,
  faEye,
  faEyeSlash,
  faKey,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const ServiceDetails = ({ vm, serviceTypes }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [expandedServices, setExpandedServices] = useState({});
  const { isAdmin } = useAuth();

  // Toggle service expansion
  const toggleServiceExpand = (serviceId) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Function to get the appropriate icon for a service
  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'DB':
        return faDatabase;
      case 'IFS Cloud':
        return faCloud;
      case 'IFS Management Server':
        return faCogs;
      case 'KaiMig':
        return faExchangeAlt;
      default:
        return faServer;
    }
  };

  // Function to render property value based on type
  const renderPropertyValue = (key, value, isServiceProperty = false) => {
    // Check if this is a password field
    const isPassword = key.toLowerCase().includes('password') ||
                       key.toLowerCase().includes('pwd') ||
                       key.toLowerCase().includes('secret');

    if (isPassword) {
      return (
        <div className="d-flex align-items-center">
          <span className={showPassword ? "" : "password-field"}>
            {showPassword ? value : '••••••••••••'}
          </span>
          {isAdmin() && (
            <Button
              variant="link"
              size="sm"
              className="ms-2 p-0"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="text-secondary"
              />
            </Button>
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div>
          {value.map((item, index) => (
            <Badge bg="secondary" className="me-1" key={index}>
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    return value;
  };

  return (
    <div className="service-details-container">
      <div className="service-details-header">
        <h5 className="mb-3">VM Details: {vm.hostname}</h5>
      </div>

      {/* Basic Information Section */}
      <div className="detail-section mb-4">
        <div className="detail-section-header mb-3">
          <FontAwesomeIcon icon={faServer} className="me-2 text-primary" />
          <h6 className="mb-0">Basic Information</h6>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Hostname</div>
            <div className="detail-value field-with-copy">
              <span className="field-content">{vm.hostname}</span>
              <CopyButton text={vm.hostname} />
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">IP Address</div>
            <div className="detail-value field-with-copy">
              <span className="field-content">{vm.ipAddress}</span>
              <CopyButton text={vm.ipAddress} />
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Admin User</div>
            <div className="detail-value field-with-copy">
              <span className="field-content">{vm.adminUser}</span>
              <CopyButton text={vm.adminUser} />
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <FontAwesomeIcon icon={faKey} className="me-1 text-warning" />
              Admin Password
            </div>
            <div className="detail-value field-with-copy">
              <span className="field-content">
                {renderPropertyValue('adminPassword', vm.adminPassword)}
              </span>
              <CopyButton text={vm.adminPassword} />
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Operating System</div>
            <div className="detail-value">
              <OSBadge os={vm.os} /> <span className="ms-2">{vm.os}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Installed Services Section */}
      <div className="detail-section">
        <div className="detail-section-header mb-3">
          <FontAwesomeIcon icon={faCogs} className="me-2 text-primary" />
          <h6 className="mb-0">Installed Services</h6>
        </div>

        {vm.services.length === 0 ? (
          <p className="text-muted">No services installed</p>
        ) : (
          <div className="service-accordion">
            {vm.services.map((service) => (
              <Card className="mb-3 service-card" key={service.id}>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => toggleServiceExpand(service.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={getServiceIcon(service.name)}
                      className="me-2 text-primary"
                      size="lg"
                    />
                    <span>{service.name}</span>
                  </div>
                  <Button variant="link" className="p-0">
                    <FontAwesomeIcon
                      icon={expandedServices[service.id] ? faChevronUp : faChevronDown}
                    />
                  </Button>
                </Card.Header>

                {expandedServices[service.id] && (
                  <Card.Body>
                    {!service.properties ? (
                      <Alert variant="warning">
                        No properties found for this service.
                      </Alert>
                    ) : (
                      <div className="service-properties-grid">
                        {Object.entries(service.properties).map(([key, value]) => {
                          // Find the label for this property
                          const serviceType = serviceTypes.find(type => type.name === service.name);

                          // Get property fields, handling both naming conventions
                          const propertyFields = serviceType?.property_fields || serviceType?.propertyFields;

                          // Find the matching field and get its label
                          let label = key;
                          if (propertyFields && Array.isArray(propertyFields)) {
                            const field = propertyFields.find(field => field.name === key);
                            if (field && field.label) {
                              label = field.label;
                            }
                          }

                          // Determine if this field should have a copy button
                          const shouldHaveCopyButton =
                            key.toLowerCase().includes('password') ||
                            key.toLowerCase().includes('user') ||
                            key.toLowerCase().includes('host') ||
                            key.toLowerCase().includes('url') ||
                            key.toLowerCase().includes('connection') ||
                            key.toLowerCase().includes('port') ||
                            key.toLowerCase().includes('ip') ||
                            key.toLowerCase().includes('address') ||
                            key.toLowerCase().includes('key');

                          return (
                            <div className="property-item" key={key}>
                              <div className="property-label">{label}</div>
                              {shouldHaveCopyButton ? (
                                <div className="property-value field-with-copy">
                                  <span className="field-content">
                                    {renderPropertyValue(key, value, true)}
                                  </span>
                                  <CopyButton text={value.toString()} />
                                </div>
                              ) : (
                                <div className="property-value">
                                  {renderPropertyValue(key, value, true)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card.Body>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;
