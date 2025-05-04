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
  faLayerGroup,
  faDesktop
} from '@fortawesome/free-solid-svg-icons';
import OSBadge from './OSBadge';
import ServiceBadge from './ServiceBadge';
import Header from './Header';
import { getVMById, getVMGroups } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const VMDetailsPage = () => {
  const { vmId } = useParams();
  const navigate = useNavigate();
  const [vm, setVM] = useState(null);
  const [vmGroup, setVMGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        // If VM belongs to a group, load group details
        if (vmData.group_id) {
          const { data: groupsData } = await getVMGroups();
          const group = groupsData?.find(g => g.id === vmData.group_id);
          setVMGroup(group);
        }
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
          <Col lg={8}>
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
                      <ListGroup.Item>
                        <strong>Hostname:</strong> {vm.hostname}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>IP Address:</strong> {vm.ip_address}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Admin User:</strong> {vm.admin_user}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Admin Password:</strong> ••••••••
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(vm.admin_password)}
                          title="Copy password"
                        >
                          Copy
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Operating System:</strong> {vm.os}
                        <span className="ms-2">
                          <OSBadge os={vm.os} osVersion={vm.os_version} />
                        </span>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>OS Version:</strong> {vm.os_version || 'Not specified'}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Group:</strong> {
                          vmGroup ? (
                            <Badge 
                              pill 
                              style={{ backgroundColor: vmGroup.color || 'var(--bs-secondary)' }}
                            >
                              {vmGroup.name}
                            </Badge>
                          ) : 'None'
                        }
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Created:</strong> {new Date(vm.created_at).toLocaleString()}
                      </ListGroup.Item>
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

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header className="bg-secondary text-white">
                <FontAwesomeIcon icon={faNetworkWired} className="me-2" />
                Quick Actions
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item action onClick={() => navigator.clipboard.writeText(vm.ip_address)}>
                  <FontAwesomeIcon icon={faNetworkWired} className="me-2 text-info" />
                  Copy IP Address
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigator.clipboard.writeText(vm.admin_user)}>
                  <FontAwesomeIcon icon={faUser} className="me-2 text-warning" />
                  Copy Username
                </ListGroup.Item>
                <ListGroup.Item action onClick={() => navigator.clipboard.writeText(vm.admin_password)}>
                  <FontAwesomeIcon icon={faKey} className="me-2 text-danger" />
                  Copy Password
                </ListGroup.Item>
              </ListGroup>
            </Card>

            {vmGroup && (
              <Card>
                <Card.Header 
                  className="text-white"
                  style={{ backgroundColor: vmGroup.color || 'var(--bs-secondary)' }}
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                  Group Details
                </Card.Header>
                <Card.Body>
                  <h5>{vmGroup.name}</h5>
                  {vmGroup.description && (
                    <p className="text-muted">{vmGroup.description}</p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VMDetailsPage;
