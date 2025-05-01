import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, ListGroup, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEye, faEyeSlash, faKey, faSave } from '@fortawesome/free-solid-svg-icons';
import ServiceForm from './ServiceForm';
import { useAuth } from '../context/AuthContext';

const VMModal = ({ show, onHide, vm, serviceTypes, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    hostname: '',
    ipAddress: '',
    adminUser: '',
    adminPassword: '',
    os: 'Linux',
    services: []
  });

  const [currentService, setCurrentService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin } = useAuth();

  // Initialize form data when VM changes
  useEffect(() => {
    if (vm) {
      setFormData({ ...vm });
    } else {
      setFormData({
        hostname: '',
        ipAddress: '',
        adminUser: '',
        adminPassword: '',
        os: 'Linux',
        services: []
      });
    }
  }, [vm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddService = () => {
    setCurrentService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId) => {
    setFormData({
      ...formData,
      services: formData.services.filter(service => service.id !== serviceId)
    });
  };

  const handleSaveService = (service) => {
    let updatedServices;

    if (service.id) {
      // Update existing service
      updatedServices = formData.services.map(s =>
        s.id === service.id ? service : s
      );
    } else {
      // Add new service
      const newService = {
        ...service,
        id: formData.services.length > 0
          ? Math.max(...formData.services.map(s => s.id)) + 1
          : 1
      };
      updatedServices = [...formData.services, newService];
    }

    setFormData({
      ...formData,
      services: updatedServices
    });

    setShowServiceForm(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{vm ? 'Edit VM' : 'Add New VM'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="hostname">
                  <Form.Label>Hostname</Form.Label>
                  <Form.Control
                    type="text"
                    name="hostname"
                    value={formData.hostname}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="ipAddress">
                  <Form.Label>IP Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="adminUser">
                  <Form.Label>Admin Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="adminUser"
                    value={formData.adminUser}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="adminPassword">
                  <Form.Label>
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faKey} className="me-1 text-warning" />
                      Admin Password
                    </div>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Password will be securely stored and masked when displayed
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="os">
                  <Form.Label>Operating System</Form.Label>
                  <Form.Select
                    name="os"
                    value={formData.os || 'Linux'}
                    onChange={handleChange}
                    required
                  >
                    <option value="Linux">Linux</option>
                    <option value="Windows">Windows</option>
                    <option value="macOS">macOS</option>
                    <option value="Unix">Unix</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Card className="mt-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Services</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddService}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  Add Service
                </Button>
              </Card.Header>
              <ListGroup variant="flush">
                {formData.services.length === 0 ? (
                  <ListGroup.Item className="text-center text-muted py-3">
                    No services added yet
                  </ListGroup.Item>
                ) : (
                  formData.services.map(service => (
                    <ListGroup.Item
                      key={service.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{service.name}</strong>
                      </div>
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditService(service)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ServiceForm
        show={showServiceForm}
        onHide={() => setShowServiceForm(false)}
        service={currentService}
        serviceTypes={serviceTypes}
        onSave={handleSaveService}
      />
    </>
  );
};

export default VMModal;
