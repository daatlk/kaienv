import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OSBadge from './OSBadge';
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
    <div className="p-3 bg-light">
      <Card>
        <Card.Header>
          <h5 className="mb-0">VM Details: {vm.hostname}</h5>
        </Card.Header>
        <Card.Body>
          {/* Basic Information Section */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Basic Information</h6>
            </Card.Header>
            <Card.Body>
              <Table size="sm" bordered>
                <tbody>
                  <tr>
                    <th>Hostname</th>
                    <td>{vm.hostname}</td>
                  </tr>
                  <tr>
                    <th>IP Address</th>
                    <td>{vm.ipAddress}</td>
                  </tr>
                  <tr>
                    <th>Admin User</th>
                    <td>{vm.adminUser}</td>
                  </tr>
                  <tr>
                    <th>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faKey} className="me-1 text-warning" />
                        Admin Password
                      </div>
                    </th>
                    <td>
                      {renderPropertyValue('adminPassword', vm.adminPassword)}
                    </td>
                  </tr>
                  <tr>
                    <th>Operating System</th>
                    <td><OSBadge os={vm.os} /></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Installed Services Section */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Installed Services</h6>
            </Card.Header>
            <Card.Body>
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
                            <Table size="sm" bordered>
                              <tbody>
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

                                  return (
                                    <tr key={key}>
                                      <th>{label}</th>
                                      <td>{renderPropertyValue(key, value, true)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          )}
                        </Card.Body>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ServiceDetails;
