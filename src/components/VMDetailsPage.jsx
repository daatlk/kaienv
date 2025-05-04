import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faServer,
  faNetworkWired,
  faUser,
  faKey,
  faEdit,
  faDesktop,
  faCopy,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import OSBadge from './OSBadge';
import ServiceBadge from './ServiceBadge';
import Header from './Header';
import { getVMById } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const VMDetailsPage = () => {
  const { vmId } = useParams();
  const navigate = useNavigate();
  const [vm, setVM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load VM details
        const { data: vmData, error: vmError } = await getVMById(vmId);

        if (vmError) {
          console.error('Error loading VM details:', vmError);
          setError('Failed to load VM details. Please try again later.');
          return;
        }

        if (!vmData) {
          setError('VM not found.');
          return;
        }

        setVM(vmData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (vmId) {
      loadData();
    }
  }, [vmId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEdit = () => {
    // Navigate to edit VM page or open edit modal
    // For now, just go back to dashboard
    navigate('/dashboard');
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${vmId}/${serviceId}`);
  };

  const handleCopy = (value, fieldName) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);

    // Reset copied field after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading VM details...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button variant="secondary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Dashboard
          </Button>
        </Container>
      </>
    );
  }

  if (!vm) {
    return (
      <>
        <Header />
        <Container className="mt-4">
          <Alert variant="warning">VM not found.</Alert>
          <Button variant="secondary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Dashboard
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-secondary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Dashboard
          </Button>
          {isAdmin() && (
            <Button variant="primary" onClick={handleEdit}>
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit VM
            </Button>
          )}
        </div>

        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faServer} className="me-2" size="lg" />
                  <h4 className="mb-0">{vm.name || vm.hostname}</h4>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Hostname:</strong> {vm.hostname}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-2"
                          onClick={() => handleCopy(vm.hostname, 'hostname')}
                          title="Copy hostname"
                        >
                          {copiedField === 'hostname' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>IP Address:</strong> {vm.ip_address}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-2"
                          onClick={() => handleCopy(vm.ip_address, 'ip')}
                          title="Copy IP address"
                        >
                          {copiedField === 'ip' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Admin User:</strong> {vm.admin_user}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-2"
                          onClick={() => handleCopy(vm.admin_user, 'user')}
                          title="Copy username"
                        >
                          {copiedField === 'user' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Admin Password:</strong> ••••••••
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-2"
                          onClick={() => handleCopy(vm.admin_password, 'password')}
                          title="Copy password"
                        >
                          {copiedField === 'password' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Operating System:</strong> {vm.os}
                          <span className="ms-2">
                            <OSBadge os={vm.os} osVersion={vm.os_version} />
                          </span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-2"
                          onClick={() => handleCopy(vm.os, 'os')}
                          title="Copy OS name"
                        >
                          {copiedField === 'os' ? (
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          ) : (
                            <FontAwesomeIcon icon={faCopy} />
                          )}
                        </Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>OS Version:</strong> {vm.os_version || 'Not specified'}
                        </div>
                        {vm.os_version && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-2"
                            onClick={() => handleCopy(vm.os_version, 'osVersion')}
                            title="Copy OS version"
                          >
                            {copiedField === 'osVersion' ? (
                              <FontAwesomeIcon icon={faCheck} className="text-success" />
                            ) : (
                              <FontAwesomeIcon icon={faCopy} />
                            )}
                          </Button>
                        )}
                      </ListGroup.Item>
                      {vm.name && (
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>VM Name:</strong> {vm.name}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-2"
                            onClick={() => handleCopy(vm.name, 'name')}
                            title="Copy VM name"
                          >
                            {copiedField === 'name' ? (
                              <FontAwesomeIcon icon={faCheck} className="text-success" />
                            ) : (
                              <FontAwesomeIcon icon={faCopy} />
                            )}
                          </Button>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header className="bg-info text-white">
                <FontAwesomeIcon icon={faDesktop} className="me-2" />
                Services
              </Card.Header>
              <Card.Body>
                {vm.services && vm.services.length > 0 ? (
                  <Row>
                    {vm.services.map(service => (
                      <Col key={service.id} md={4} className="mb-3">
                        <Card
                          className="h-100 service-card"
                          onClick={() => handleServiceClick(service.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Card.Body className="text-center">
                            <ServiceBadge name={service.name} size="lg" />
                            <h5 className="mt-2">{service.name}</h5>
                            {service.properties?.port && (
                              <Badge bg="secondary">Port: {service.properties.port}</Badge>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">No services configured for this VM.</Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VMDetailsPage;
