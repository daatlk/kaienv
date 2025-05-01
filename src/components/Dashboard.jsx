import React, { useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Spinner, Overlay, Tooltip, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faServer,
  faChevronDown,
  faChevronUp,
  faEye,
  faEyeSlash,
  faLock,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import OSBadge from './OSBadge';
import ServiceBadge from './ServiceBadge';
import VMModal from './VMModal';
import ServiceDetails from './ServiceDetails';
import LoadingSpinner from './LoadingSpinner';
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
  const [expandedVMs, setExpandedVMs] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const { isAdmin, currentUser } = useAuth();

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

  const toggleExpand = (vmId) => {
    setExpandedVMs({
      ...expandedVMs,
      [vmId]: !expandedVMs[vmId]
    });
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
            <h4>No VMs found</h4>
            <p>Click the "Add VM" button to add your first VM.</p>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th></th>
              <th>Hostname</th>
              <th>IP Address</th>
              <th>OS</th>
              <th>Admin User</th>
              <th>Services</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vms.map((vm) => (
              <React.Fragment key={vm.id}>
                <tr>
                  <td className="text-center">
                    <Button
                      variant="link"
                      onClick={() => toggleExpand(vm.id)}
                      aria-label={expandedVMs[vm.id] ? "Collapse" : "Expand"}
                    >
                      <FontAwesomeIcon
                        icon={expandedVMs[vm.id] ? faChevronUp : faChevronDown}
                      />
                    </Button>
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faServer} className="me-2 text-secondary" />
                    {vm.hostname}
                  </td>
                  <td>{vm.ipAddress}</td>
                  <td><OSBadge os={vm.os} /></td>
                  <td>{vm.adminUser}</td>
                  <td>
                    {vm.services.map(service => (
                      <ServiceBadge key={service.id} name={service.name} />
                    ))}
                  </td>
                  <td>
                    {isAdmin() ? (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditVM(vm)}
                          disabled={loading}
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
                            <FontAwesomeIcon icon={faEdit} />
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteVM(vm.id, vm.hostname)}
                          disabled={loading}
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
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Badge bg="secondary">
                        <FontAwesomeIcon icon={faLock} className="me-1" />
                        Read Only
                      </Badge>
                    )}
                  </td>
                </tr>
                {expandedVMs[vm.id] && (
                  <tr>
                    <td colSpan="6" className="p-0">
                      <ServiceDetails vm={vm} serviceTypes={serviceTypes} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
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
