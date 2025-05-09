import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
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
  faSpinner,
  faCircle // For status indicators
} from '@fortawesome/free-solid-svg-icons';
import VMModal from './VMModal';
import ServiceDetails from './ServiceDetails';
// import LoadingSpinner from './LoadingSpinner'; // Assuming this might be removed or integrated if not used elsewhere
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Import custom CSS for Dashboard

// Helper function to determine VM status and corresponding style
const getStatusIndicator = (vm) => {
  // Placeholder logic for VM status - this should be replaced with actual status detection
  // For now, let's assume a 'status' property on the VM object or derive it simply.
  // Example: 'online', 'offline', 'warning'
  const status = vm.status || (vm.ipAddress ? 'online' : 'offline'); // Simplified placeholder

  switch (status) {
    case 'online':
      return { icon: faCircle, color: 'text-success', label: 'Online' };
    case 'offline':
      return { icon: faCircle, color: 'text-danger', label: 'Offline' };
    case 'warning':
      return { icon: faCircle, color: 'text-warning', label: 'Warning' };
    default:
      return { icon: faCircle, color: 'text-muted', label: 'Unknown' };
  }
};

const Dashboard = ({
  vms,
  serviceTypes,
  onAddVM,
  onUpdateVM,
  onDeleteVM,
  loading = false,
  operationType = null,
  // Simulate fetching VMs if not passed directly, or if loading state is managed here
  // fetchVMs // Example if Dashboard fetches its own data
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentVM, setCurrentVM] = useState(null);
  const [expandedVMs, setExpandedVMs] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const { isAdmin } = useAuth(); // Removed currentUser as it's not directly used here

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
    const operation = vm.id ? 'updated' : 'added';
    const loadingType = vm.id ? 'update' : 'add';

    // Consider managing loading state specifically for save operation if needed
    // setLoading(true); // if loading is managed within Dashboard for this action

    if (vm.id) {
      success = await onUpdateVM(vm);
    } else {
      success = await onAddVM(vm);
    }

    if (success) {
      showSuccess(`VM "${vm.hostname}" was ${operation} successfully`);
      setShowModal(false);
    }
    // setLoading(false); // if loading is managed within Dashboard
  };

  const toggleExpand = (vmId) => {
    setExpandedVMs(prev => ({
      ...prev,
      [vmId]: !prev[vmId]
    }));
  };

  if (loading && !vms.length) { // Show a general loading spinner if vms are being fetched initially
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading VMs...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-3">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="position-fixed top-0 end-0 m-3" style={{ zIndex: 1050 }}>
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          {successMessage}
        </Alert>
      )}

      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="dashboard-title">VM Inventory</h2>
        </Col>
        <Col xs="auto">
          {isAdmin() && (
            <Button
              variant="primary"
              onClick={handleAddVM}
              disabled={loading && operationType === 'add'}
              className="add-vm-button"
            >
              {loading && operationType === 'add' ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
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

      {vms.length === 0 && !loading ? (
        <Card className="text-center p-4 shadow-sm">
          <Card.Body>
            <FontAwesomeIcon icon={faServer} size="3x" className="text-muted mb-3" />
            <h4>No Virtual Machines Found</h4>
            {isAdmin() ? (
                <p>Click the "Add VM" button to get started.</p>
            ) : (
                <p>There are currently no VMs to display.</p>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm vm-table-card">
          <Table responsive hover className="vm-table">
            <thead className="table-light">
              <tr>
                <th className="text-center">Status</th>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>OS</th>
                <th>Admin User</th>
                <th>Services</th>
                {isAdmin() && <th className="text-center">Actions</th>}
                <th className="text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm, index) => {
                const statusInfo = getStatusIndicator(vm);
                return (
                  <React.Fragment key={vm.id}>
                    <tr className={`vm-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
                      <td className="text-center align-middle">
                        <FontAwesomeIcon icon={statusInfo.icon} className={`${statusInfo.color} me-1`} title={statusInfo.label} />
                        <span className="visually-hidden">{statusInfo.label}</span>
                      </td>
                      <td className="align-middle">
                        <FontAwesomeIcon icon={faServer} className="me-2 text-primary" />
                        <strong>{vm.hostname}</strong>
                      </td>
                      <td className="align-middle">{vm.ipAddress || '-'}</td>
                      <td className="align-middle">{vm.os || 'N/A'}</td>
                      <td className="align-middle">{vm.adminUser || '-'}</td>
                      <td className="align-middle services-cell">
                        {vm.services && vm.services.length > 0 ? (
                            vm.services.map(service => service.name).join(', ')
                        ) : (
                            <span className="text-muted">No services</span>
                        )}
                      </td>
                      {isAdmin() && (
                        <td className="text-center align-middle actions-cell">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1 action-button"
                            onClick={() => handleEditVM(vm)}
                            disabled={loading && operationType === 'update' && currentVM?.id === vm.id}
                            title="Edit VM"
                          >
                            {loading && operationType === 'update' && currentVM?.id === vm.id ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faEdit} />
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="action-button"
                            onClick={() => handleDeleteVM(vm.id, vm.hostname)}
                            disabled={loading && operationType === 'delete' && currentVM?.id === vm.id}
                            title="Delete VM"
                          >
                            {loading && operationType === 'delete' && currentVM?.id === vm.id ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </Button>
                        </td>
                      )}
                      <td className="text-center align-middle">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleExpand(vm.id)}
                          aria-expanded={expandedVMs[vm.id] || false}
                          aria-controls={`vm-details-${vm.id}`}
                          title={expandedVMs[vm.id] ? "Hide Details" : "Show Details"}
                          className="details-button"
                        >
                          <FontAwesomeIcon icon={expandedVMs[vm.id] ? faChevronUp : faChevronDown} />
                        </Button>
                      </td>
                    </tr>
                    {expandedVMs[vm.id] && (
                      <tr id={`vm-details-${vm.id}`} className="vm-details-row">
                        <td colSpan={isAdmin() ? 8 : 7} className="p-0">
                          <div className="vm-details-container p-3">
                            <ServiceDetails vm={vm} serviceTypes={serviceTypes} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {showModal && (
        <VMModal
          show={showModal}
          onHide={() => setShowModal(false)}
          vm={currentVM}
          serviceTypes={serviceTypes}
          onSave={handleSaveVM}
          loading={loading && (operationType === 'add' || operationType === 'update')}
        />
      )}
    </div>
  );
};

export default Dashboard;

