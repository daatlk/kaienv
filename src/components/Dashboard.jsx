import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faPlus,
  faEdit,
  faTrash,
  faServer,
  faLock,
  faCheck,
  faNetworkWired,
  faUser,
  faKey,
  faCopy,
  faDesktop
} from '@fortawesome/free-solid-svg-icons';
import OSBadge from './OSBadge';
import ServiceBadge from './ServiceBadge';
import VMModal from './VMModal';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({
  vms,
  serviceTypes,
  onAddVM,
  onUpdateVM,
  onDeleteVM,
  loading = false,
  operationType = null
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentVM, setCurrentVM] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Show success message for a short time when an operation completes
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddVM = () => {
    setCurrentVM(null);
    setShowModal(true);
  };

  const handleEditVM = (vm) => {
    setCurrentVM(vm);
    setShowModal(true);
  };

  const handleDeleteVM = async (vmId, hostname) => {
    if (window.confirm(`Are you sure you want to delete the VM "${hostname}"?`)) {
      const success = await onDeleteVM(vmId);
      if (success) {
        showSuccess(`VM "${hostname}" was deleted successfully`);
      }
    }
  };

  const handleSaveVM = async (vm) => {
    let success;

    if (vm.id) {
      success = await onUpdateVM(vm);
      if (success) {
        showSuccess(`VM "${vm.hostname}" was updated successfully`);
      }
    } else {
      success = await onAddVM(vm);
      if (success) {
        showSuccess(`VM "${vm.hostname}" was added successfully`);
      }
    }

    if (success) {
      setShowModal(false);
    }
  };

  const handleServiceClick = (vmId, serviceId) => {
    navigate(`/service/${vmId}/${serviceId}`);
  };

  // Custom component for VM info items with tooltips and copy functionality
  const VMInfoItem = ({ icon, value, label, isPassword = false, iconColor = "", showValue = false }) => {
    const [copied, setCopied] = useState(false);

    const renderTooltip = (props) => (
      <Tooltip id={`tooltip-${label}`} {...props}>
        {copied ? "Copied!" : `${label}: ${isPassword ? "••••••••" : value}`}
      </Tooltip>
    );

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    // Determine icon color class
    const getIconColorClass = () => {
      if (iconColor) return iconColor;
      if (icon === faNetworkWired) return "text-info";
      if (icon === faUser) return "text-warning";
      if (icon === faKey) return "text-danger";
      if (icon === faDesktop) return "text-success";
      return "text-secondary";
    };

    return (
      <div className="vm-info-item">
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <div className="vm-info-icon" onClick={handleCopy} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon
              icon={copied ? faCopy : icon}
              className={copied ? "text-success" : getIconColorClass()}
            />
          </div>
        </OverlayTrigger>
        {showValue && (
          <div className="vm-info-content">
            <div className="vm-info-value">
              {isPassword ? "••••••••" : value}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Success message */}
      {successMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header bg-success text-white">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              <strong className="me-auto">Success</strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">
              {successMessage}
            </div>
          </div>
        </div>
      )}



      <Row className="mb-4">
        <Col>
          <h2>VM Inventory</h2>
        </Col>
        <Col xs="auto">
          {isAdmin() && (
            <Button
              variant="primary"
              onClick={handleAddVM}
              disabled={loading && operationType === 'add'}
            >
              {loading && operationType === 'add' ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Adding...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add VM
                </>
              )}
            </Button>
          )}
        </Col>
      </Row>

      {vms.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FontAwesomeIcon icon={faServer} className="text-muted mb-3" size="4x" />
            <h4>No VMs Available</h4>
            {isAdmin() ? (
              <>
                <p>There are no virtual machines in the system or we couldn't retrieve them.</p>
                <p>You can add a new VM by clicking the "Add VM" button above.</p>
                <Button
                  variant="primary"
                  onClick={handleAddVM}
                  className="mt-3"
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Your First VM
                </Button>
              </>
            ) : (
              <>
                <p>There are no virtual machines available or we couldn't retrieve them.</p>
                <p>Please contact your administrator if you believe this is an error.</p>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {vms.map((vm) => (
            <Col key={vm.id}>
              <Card className="vm-card h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faServer} className="me-2 text-primary" size="lg" />
                    <h5 className="mb-0">{vm.hostname}</h5>
                    <div className="ms-2">
                      <OSBadge os={vm.os} osVersion={vm.os_version} />
                    </div>
                  </div>
                  <div>
                    {isAdmin() ? (
                      <div className="d-flex">
                        <Button
                          variant="link"
                          className="p-1 me-1"
                          onClick={() => handleEditVM(vm)}
                          disabled={loading}
                          title="Edit VM"
                        >
                          {loading && operationType === 'update' && currentVM?.id === vm.id ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faEdit} className="text-primary" />
                          )}
                        </Button>
                        <Button
                          variant="link"
                          className="p-1"
                          onClick={() => handleDeleteVM(vm.id, vm.hostname)}
                          disabled={loading}
                          title="Delete VM"
                        >
                          {loading && operationType === 'delete' && currentVM?.id === vm.id ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faTrash} className="text-danger" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Badge bg="secondary" pill>
                        <FontAwesomeIcon icon={faLock} className="me-1" />
                        Read Only
                      </Badge>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="vm-info-grid">
                    <VMInfoItem
                      icon={faNetworkWired}
                      value={vm.ip_address}
                      label="IP Address"
                      showValue={false}
                    />

                    <VMInfoItem
                      icon={faUser}
                      value={vm.admin_user}
                      label="Admin User"
                      showValue={false}
                    />

                    <VMInfoItem
                      icon={faKey}
                      value={vm.admin_password}
                      label="Admin Password"
                      isPassword={true}
                      showValue={false}
                    />
                  </div>

                  <div className="mt-3">
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faServer} className="me-2 text-secondary" />
                      <strong>Services</strong>
                    </div>
                    <div className="service-badges">
                      {vm.services.map(service => (
                        <div
                          key={service.id}
                          onClick={() => handleServiceClick(vm.id, service.id)}
                          className="service-badge-wrapper"
                        >
                          <ServiceBadge name={service.name} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <small className="text-muted">Click on a service icon to view details</small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <VMModal
        show={showModal}
        onHide={() => setShowModal(false)}
        vm={currentVM}
        serviceTypes={serviceTypes}
        onSave={handleSaveVM}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
