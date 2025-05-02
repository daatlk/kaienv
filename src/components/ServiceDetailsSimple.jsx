import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CopyButton from './CopyButton';
import {
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const ServiceDetailsSimple = ({ service, serviceTypes }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin } = useAuth();

  // Function to render property value based on type
  const renderPropertyValue = (key, value) => {
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

  // Find the service type to get property labels
  const serviceType = serviceTypes.find(type => type.name === service.name);

  // Get property fields, handling both naming conventions
  const propertyFields = serviceType?.property_fields || serviceType?.propertyFields || [];

  return (
    <div className="service-details-simple">
      <Card className="service-card">
        <Card.Body className="pt-4">
          {!service.properties ? (
            <p className="text-muted">No properties available for this service.</p>
          ) : (
            <div className="service-properties-grid">
              {Object.entries(service.properties)
                // Filter out dataFilePath
                .filter(([key]) => key !== 'dataFilePath')
                .map(([key, value]) => {
                  // Find the matching field and get its label
                  let label = key;
                  if (propertyFields && Array.isArray(propertyFields)) {
                    const field = propertyFields.find(field => field.name === key);
                    if (field && field.label) {
                      label = field.label;
                    }
                  }

                  // Convert label to uppercase
                  label = label.toUpperCase();

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
                            {renderPropertyValue(key, value)}
                          </span>
                          <CopyButton text={value.toString()} />
                        </div>
                      ) : (
                        <div className="property-value">
                          {renderPropertyValue(key, value)}
                        </div>
                      )}
                    </div>
                  );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ServiceDetailsSimple;
