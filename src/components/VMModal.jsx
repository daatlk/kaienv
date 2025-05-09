import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, ListGroup, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEye, faEyeSlash, faKey, faSave, faServer, faNetworkWired, faUserShield, faDesktop, faListAlt } from '@fortawesome/free-solid-svg-icons';
import ServiceForm from './ServiceForm';
// import { useAuth } from '../context/AuthContext'; // Not directly used for isAdmin checks here, can be removed if not needed for other purposes
import './VMModal.css'; // Import custom CSS for VMModal

const VMModal = ({ show, onHide, vm, serviceTypes, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    hostname: '',
    ipAddress: '',
    adminUser: '',
    adminPassword: '',
    os: 'Linux', // Default OS
    services: []
  });
  const [validated, setValidated] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (vm) {
      setFormData({
        hostname: vm.hostname || '',
        ipAddress: vm.ipAddress || '',
        adminUser: vm.adminUser || '',
        adminPassword: vm.adminPassword || '', // Password should ideally not be re-populated directly for editing unless necessary
        os: vm.os || 'Linux',
        services: vm.services || []
      });
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
    setValidated(false); // Reset validation state when modal opens or vm changes
  }, [vm, show]); // Depend on show as well to reset form when modal is re-opened for a new VM

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    onSave(formData);
    setValidated(false); // Reset validation after successful save attempt
  };

  const handleAddService = () => {
    setCurrentService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceIdOrIndex) => { // Assuming service might not have an ID before saving
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, index) => index !== serviceIdOrIndex) // Use index if ID is not reliable for unsaved services
    }));
  };

  const handleSaveService = (service) => {
    setFormData(prev => {
      const existingServiceIndex = prev.services.findIndex(s => s.id === service.id && service.id !== undefined);
      let updatedServices;
      if (existingServiceIndex > -1) {
        updatedServices = prev.services.map((s, index) => index === existingServiceIndex ? service : s);
      } else {
        // Assign a temporary client-side ID if it's a new service for key prop and editing before main save
        const newService = { ...service, id: service.id || `temp-${Date.now()}` };
        updatedServices = [...prev.services, newService];
      }
      return { ...prev, services: updatedServices };
    });
    setShowServiceForm(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered className="vm-modal">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={vm ? faEdit : faPlus} className="me-2" />
            {vm ? 'Edit Virtual Machine' : 'Add New Virtual Machine'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <h5 className="mb-3 form-section-title">VM Configuration</h5>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formHostname">
                <Form.Label><FontAwesomeIcon icon={faServer} className="me-2 text-muted" />Hostname</Form.Label>
                <Form.Control
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  placeholder="e.g., prod-web-01"
                  required
                />
                <Form.Control.Feedback type="invalid">Please provide a hostname.</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="formIpAddress">
                <Form.Label><FontAwesomeIcon icon={faNetworkWired} className="me-2 text-muted" />IP Address</Form.Label>
                <Form.Control
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="e.g., 192.168.1.100"
                  // Basic IP pattern validation, can be enhanced
                  pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                  required
                />
                <Form.Control.Feedback type="invalid">Please provide a valid IP address.</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="formAdminUser">
                <Form.Label><FontAwesomeIcon icon={faUserShield} className="me-2 text-muted" />Admin Username</Form.Label>
                <Form.Control
                  type="text"
                  name="adminUser"
                  value={formData.adminUser}
                  onChange={handleChange}
                  placeholder="e.g., administrator"
                  required
                />
                <Form.Control.Feedback type="invalid">Please provide an admin username.</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="formAdminPassword">
                <Form.Label><FontAwesomeIcon icon={faKey} className="me-2 text-muted" />Admin Password</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="Enter strong password"
                    required={!vm} // Password required for new VM, optional for edit (if not changing)
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} title={showPassword ? "Hide password" : "Show password"}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                  <Form.Control.Feedback type="invalid">Please provide a password.</Form.Control.Feedback>
                </InputGroup>
                {vm && <Form.Text className="text-muted">Leave blank if you do not want to change the password.</Form.Text>}
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col} md="12" controlId="formOs">
                <Form.Label><FontAwesomeIcon icon={faDesktop} className="me-2 text-muted" />Operating System</Form.Label>
                <Form.Select
                  name="os"
                  value={formData.os}
                  onChange={handleChange}
                  required
                >
                  <option value="Linux">Linux (e.g., Ubuntu, CentOS)</option>
                  <option value="Windows">Windows (e.g., Server 2019)</option>
                  <option value="macOS">macOS</option>
                  <option value="Unix">Unix (e.g., Solaris, AIX)</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">Please select an operating system.</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Card className="services-card shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <h6 className="mb-0"><FontAwesomeIcon icon={faListAlt} className="me-2 text-primary" />Services</h6>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAddService}
                  className="add-service-button"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Service
                </Button>
              </Card.Header>
              {formData.services.length === 0 ? (
                <Card.Body className="text-center text-muted py-3">
                  No services have been added to this VM yet.
                </Card.Body>
              ) : (
                <ListGroup variant="flush">
                  {formData.services.map((service, index) => (
                    <ListGroup.Item key={service.id || `service-${index}`} className="d-flex justify-content-between align-items-center service-list-item">
                      <div>
                        <strong>{service.name}</strong>
                        {service.properties && <small className="d-block text-muted">{Object.entries(service.properties).map(([key, val]) => `${key}: ${val}`).join(', ')}</small>}
                      </div>
                      <div>
                        <Button variant="outline-primary" size="sm" className="me-2 action-button" onClick={() => handleEditService(service)} title="Edit Service">
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="action-button" onClick={() => handleDeleteService(index)} title="Delete Service">
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card>

          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={onHide} disabled={loading} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading} className="save-vm-button">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {vm ? 'Save Changes' : 'Add VM'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {showServiceForm && (
        <ServiceForm
          show={showServiceForm}
          onHide={() => setShowServiceForm(false)}
          service={currentService}
          serviceTypes={serviceTypes} // Ensure serviceTypes is passed down if needed by ServiceForm
          onSave={handleSaveService}
        />
      )}
    </>
  );
};

export default VMModal;

