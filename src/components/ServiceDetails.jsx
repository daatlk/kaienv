import React, { useState } from 'react';
import { Card, Row, Col, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faCloud,
  faCogs,
  faExchangeAlt,
  faServer,
  faEye,
  faEyeSlash,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const ServiceDetails = ({ vm, serviceTypes }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin } = useAuth();

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
          <Row>
            <Col md={4}>
              <h6>Basic Information</h6>
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
                    <td>{vm.os || 'Linux'}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={8}>
              <h6>Installed Services</h6>
              {vm.services.length === 0 ? (
                <p className="text-muted">No services installed</p>
              ) : (
                vm.services.map((service) => (
                  <Card className="mb-3" key={service.id}>
                    <Card.Header className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={getServiceIcon(service.name)}
                        className="me-2 text-primary"
                      />
                      <span>{service.name}</span>
                    </Card.Header>
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
                  </Card>
                ))
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ServiceDetails;
