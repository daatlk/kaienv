import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const ServiceForm = ({ show, onHide, service, serviceTypes, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    properties: {}
  });

  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const { isAdmin } = useAuth();

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({ ...service });
      const serviceType = serviceTypes.find(type => type.name === service.name);
      setSelectedServiceType(serviceType);

      // Log for debugging
      if (serviceType) {
        console.log('Selected service type:', serviceType);
        console.log('Property fields:', serviceType.property_fields || serviceType.propertyFields);
      }
    } else {
      // For new service, initialize with first service type
      if (serviceTypes.length > 0) {
        const firstServiceType = serviceTypes[0];
        console.log('First service type:', firstServiceType);

        // Initialize properties with empty values
        const initialProperties = {};
        const propertyFields = firstServiceType.property_fields || firstServiceType.propertyFields;

        if (propertyFields && Array.isArray(propertyFields)) {
          propertyFields.forEach(field => {
            initialProperties[field.name] = field.type === 'array' ? [] : '';
          });
        }

        setFormData({
          name: firstServiceType.name,
          properties: initialProperties
        });
        setSelectedServiceType(firstServiceType);
      } else {
        setFormData({
          name: '',
          properties: {}
        });
        setSelectedServiceType(null);
      }
    }
  }, [service, serviceTypes]);

  const handleServiceTypeChange = (e) => {
    const serviceName = e.target.value;
    const serviceType = serviceTypes.find(type => type.name === serviceName);

    // Initialize properties with empty values based on the service type
    const initialProperties = {};
    if (serviceType) {
      // Check if propertyFields exists and is an array
      const propertyFields = serviceType.property_fields || serviceType.propertyFields;

      if (propertyFields && Array.isArray(propertyFields)) {
        propertyFields.forEach(field => {
          initialProperties[field.name] = field.type === 'array' ? [] : '';
        });
      } else {
        console.error('Property fields missing or invalid in handleServiceTypeChange:', serviceType);
      }
    }

    setFormData({
      ...formData,
      name: serviceName,
      properties: initialProperties
    });

    setSelectedServiceType(serviceType);
  };

  const handlePropertyChange = (name, value) => {
    setFormData({
      ...formData,
      properties: {
        ...formData.properties,
        [name]: value
      }
    });
  };

  const handleArrayPropertyChange = (name, value) => {
    // Split comma-separated values into an array
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');

    handlePropertyChange(name, arrayValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility({
      ...passwordVisibility,
      [fieldName]: !passwordVisibility[fieldName]
    });
  };

  // Check if a field is a password field
  const isPasswordField = (fieldName) => {
    return fieldName.toLowerCase().includes('password') ||
           fieldName.toLowerCase().includes('pwd') ||
           fieldName.toLowerCase().includes('secret');
  };

  // Render form fields based on the selected service type
  const renderPropertyFields = () => {
    if (!selectedServiceType) return null;

    // Check if propertyFields exists and is an array
    const propertyFields = selectedServiceType.property_fields || selectedServiceType.propertyFields;

    if (!propertyFields || !Array.isArray(propertyFields)) {
      console.error('Property fields missing or invalid:', selectedServiceType);
      return (
        <div className="alert alert-warning">
          <strong>Warning:</strong> Service type configuration is missing or invalid.
          Please check the service type definition in the database.
        </div>
      );
    }

    return propertyFields.map(field => {
      const value = formData.properties[field.name] || '';
      const isPassword = isPasswordField(field.name);

      if (field.type === 'array') {
        // For array type, we'll use a text input with comma-separated values
        const stringValue = Array.isArray(value) ? value.join(', ') : '';

        return (
          <Form.Group className="mb-3" key={field.name}>
            <Form.Label>{field.label}</Form.Label>
            <Form.Control
              type="text"
              value={stringValue}
              onChange={(e) => handleArrayPropertyChange(field.name, e.target.value)}
              placeholder="Enter comma-separated values"
            />
            <Form.Text className="text-muted">
              Enter values separated by commas
            </Form.Text>
          </Form.Group>
        );
      }

      if (isPassword) {
        return (
          <Form.Group className="mb-3" key={field.name}>
            <Form.Label>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faKey} className="me-1 text-warning" />
                {field.label}
              </div>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type={passwordVisibility[field.name] ? "text" : "password"}
                value={value}
                onChange={(e) => handlePropertyChange(field.name, e.target.value)}
              />
              <Button
                variant="outline-secondary"
                onClick={() => togglePasswordVisibility(field.name)}
                aria-label={passwordVisibility[field.name] ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={passwordVisibility[field.name] ? faEyeSlash : faEye} />
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              Password will be securely stored and masked when displayed
            </Form.Text>
          </Form.Group>
        );
      }

      return (
        <Form.Group className="mb-3" key={field.name}>
          <Form.Label>{field.label}</Form.Label>
          <Form.Control
            type={field.type}
            value={value}
            onChange={(e) => handlePropertyChange(field.name, e.target.value)}
          />
        </Form.Group>
      );
    });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{service ? 'Edit Service' : 'Add New Service'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Service Type</Form.Label>
            <Form.Select
              value={formData.name}
              onChange={handleServiceTypeChange}
              disabled={!!service} // Disable changing service type when editing
            >
              {serviceTypes.map(type => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {renderPropertyFields()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ServiceForm;
