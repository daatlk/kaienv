import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, Alert, OverlayTrigger, Tooltip, Accordion, Form, InputGroup } from 'react-bootstrap';
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
  faDesktop,
  faLayerGroup,
  faObjectGroup,
  faFilter,
  faExchangeAlt,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import OSBadge from './OSBadge';
import ServiceBadge from './ServiceBadge';
import VMModal from './VMModal';
import VMGroupModal from './VMGroupModal';
import BulkMoveModal from './BulkMoveModal';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({
  vms,
  serviceTypes,
  vmGroups = [],
  onAddVM,
  onUpdateVM,
  onDeleteVM,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onMoveVMs,
  loading = false,
  operationType = null
}) => {
  const [showVMModal, setShowVMModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [currentVM, setCurrentVM] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedVMs, setSelectedVMs] = useState([]);
  const [filterGroupId, setFilterGroupId] = useState('all'); // 'all' or a group ID
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Filter VMs based on selected group
  const filteredVMs = useMemo(() => {
    if (filterGroupId === 'all') {
      return vms;
    } else if (filterGroupId === 'ungrouped') {
      return vms.filter(vm => !vm.group_id);
    } else {
      return vms.filter(vm => vm.group_id === filterGroupId);
    }
  }, [vms, filterGroupId]);

  // Group VMs by their group_id
  const groupedVMs = useMemo(() => {
    const grouped = {
      ungrouped: []
    };

    // First add all groups as keys
    vmGroups.forEach(group => {
      grouped[group.id] = [];
    });

    // Then add VMs to their respective groups
    filteredVMs.forEach(vm => {
      if (vm.group_id && grouped[vm.group_id]) {
        grouped[vm.group_id].push(vm);
      } else {
        grouped.ungrouped.push(vm);
      }
    });

    return grouped;
  }, [filteredVMs, vmGroups]);

  // Handle VM selection for bulk operations
  const handleVMSelection = (vm) => {
    if (selectedVMs.some(selectedVM => selectedVM.id === vm.id)) {
      setSelectedVMs(selectedVMs.filter(selectedVM => selectedVM.id !== vm.id));
    } else {
      setSelectedVMs([...selectedVMs, vm]);
    }
  };

  // Clear all selected VMs
  const clearSelection = () => {
    setSelectedVMs([]);
  };

  // Handle bulk move of VMs
  const handleBulkMove = () => {
    if (selectedVMs.length > 0) {
      setShowBulkMoveModal(true);
    }
  };

  // Execute the bulk move operation
  const executeBulkMove = async (vmIds, targetGroupId) => {
    const success = await onMoveVMs(vmIds, targetGroupId);
    if (success) {
      const groupName = targetGroupId
        ? vmGroups.find(g => g.id === targetGroupId)?.name
        : 'Ungrouped';
      showSuccess(`${vmIds.length} VMs moved to ${groupName}`);
      setShowBulkMoveModal(false);
      setSelectedVMs([]);
    }
  };

  const handleAddVM = () => {
    setCurrentVM(null);
    setShowVMModal(true);
  };

  const handleEditVM = (vm) => {
    setCurrentVM(vm);
    setShowVMModal(true);
  };

  const handleDeleteVM = async (vmId, vmName, hostname) => {
    if (window.confirm(`Are you sure you want to delete the VM "${vmName || hostname}"?`)) {
      const success = await onDeleteVM(vmId);
      if (success) {
        showSuccess(`VM "${vmName || hostname}" was deleted successfully`);
      }
    }
  };

  const handleSaveVM = async (vm) => {
    let success;

    if (vm.id) {
      success = await onUpdateVM(vm);
      if (success) {
        showSuccess(`VM "${vm.name || vm.hostname}" was updated successfully`);
      }
    } else {
      success = await onAddVM(vm);
      if (success) {
        showSuccess(`VM "${vm.name || vm.hostname}" was added successfully`);
      }
    }

    if (success) {
      setShowVMModal(false);
    }
  };

  const handleAddGroup = () => {
    setCurrentGroup(null);
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setCurrentGroup(group);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? VMs in this group will become ungrouped.`)) {
      const success = await onDeleteGroup(groupId);
      if (success) {
        showSuccess(`Group "${groupName}" was deleted successfully`);
      }
    }
  };

  const handleSaveGroup = async (group) => {
    let success;

    if (group.id) {
      success = await onUpdateGroup(group);
      if (success) {
        showSuccess(`Group "${group.name}" was updated successfully`);
      }
    } else {
      success = await onAddGroup(group);
      if (success) {
        showSuccess(`Group "${group.name}" was created successfully`);
      }
    }

    if (success) {
      setShowGroupModal(false);
    }
  };

  const handleServiceClick = (vmId, serviceId) => {
    navigate(`/service/${vmId}/${serviceId}`);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
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

    return (
      <div className="vm-info-item">
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
          <Button
            variant="light"
            size="sm"
            className="text-secondary p-1"
            onClick={handleCopy}
            title={`Copy ${label}`}
          >
            <FontAwesomeIcon
              icon={icon}
              className={`me-1 ${iconColor}`}
            />
            {copied && <FontAwesomeIcon icon={faCheck} className="text-success ms-1" />}
            {showValue && (
              <span className="ms-1">
                {isPassword ? "••••••••" : value}
              </span>
            )}
          </Button>
        </OverlayTrigger>
      </div>
    );
  };

  // VM Card Renderer Function - defined before it's used
  const renderVMCard = (vm) => {
    // Determine if this VM is selected
    const isSelected = selectedVMs.some(selectedVM => selectedVM.id === vm.id);

    // Get the group color if VM belongs to a group
    const groupColor = vm.group_id
      ? vmGroups.find(g => g.id === vm.group_id)?.color
      : null;

    return (
      <Col key={vm.id}>
        <Card
          className={`vm-card h-100 ${isSelected ? 'border-primary' : ''}`}
          style={groupColor ? { borderLeft: `4px solid ${groupColor}` } : {}}
        >
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {isAdmin() && (
                <Form.Check
                  type="checkbox"
                  className="me-2"
                  checked={isSelected}
                  onChange={() => handleVMSelection(vm)}
                  aria-label={`Select VM ${vm.name || vm.hostname}`}
                />
              )}
              <FontAwesomeIcon
                icon={faServer}
                className="me-2"
                style={{ color: groupColor || 'var(--bs-primary)' }}
                size="lg"
              />
              <div>
                <h5 className="mb-0">{vm.hostname}</h5>
              </div>
              <div className="ms-2">
                <OSBadge os={vm.os} osVersion={vm.os_version} />
              </div>
            </div>
            <div>
              <div className="d-flex">
                <Button
                  variant="link"
                  className="p-1 me-1"
                  onClick={() => navigate(`/vm/${vm.id}`)}
                  title="View VM Details"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
                </Button>

                {isAdmin() && (
                  <>
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
                      onClick={() => handleDeleteVM(vm.id, vm.name, vm.hostname)}
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
                  </>
                )}
              </div>
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
            <small className="text-muted">
              Click <FontAwesomeIcon icon={faInfoCircle} className="text-info mx-1" /> to view VM details or
              click on a service icon to view service details
            </small>
          </Card.Footer>
        </Card>
      </Col>
    );
  };

  return (
    <div>
      {successMessage && (
        <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h2>VM Inventory</h2>
        </Col>
        <Col xs="auto">
          {isAdmin() && (
            <div className="d-flex">
              <Button
                variant="outline-primary"
                onClick={handleAddGroup}
                disabled={loading && operationType === 'add_group'}
                className="me-2"
              >
                {loading && operationType === 'add_group' ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Adding Group...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                    Add Group
                  </>
                )}
              </Button>
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
                    Adding VM...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Add VM
                  </>
                )}
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Filter and Bulk Actions */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Filter by Group
              </InputGroup.Text>
              <Form.Select
                value={filterGroupId}
                onChange={(e) => setFilterGroupId(e.target.value)}
              >
                <option value="all">All VMs</option>
                <option value="ungrouped">Ungrouped VMs</option>
                {vmGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center">
          {selectedVMs.length > 0 && (
            <div className="d-flex align-items-center">
              <Badge bg="primary" className="me-2">
                {selectedVMs.length} VM{selectedVMs.length !== 1 ? 's' : ''} selected
              </Badge>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearSelection}
                className="me-2"
              >
                Clear
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleBulkMove}
              >
                <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                Move to Group
              </Button>
            </div>
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
        <div>
          {/* Display VM Groups */}
          {vmGroups.length > 0 && (
            <Accordion defaultActiveKey={vmGroups.map(g => g.id)} className="mb-4" alwaysOpen>
              {vmGroups.map(group => {
                const groupVMs = filteredVMs.filter(vm => vm.group_id === group.id);
                if (groupVMs.length === 0 && filterGroupId !== 'all' && filterGroupId !== group.id) return null;

                return (
                  <Accordion.Item key={group.id} eventKey={group.id}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center justify-content-between w-100 me-3">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faObjectGroup}
                            className="me-2"
                            style={{ color: group.color || 'var(--bs-primary)' }}
                          />
                          <span className="fw-bold">{group.name}</span>
                          <Badge
                            pill
                            style={{
                              backgroundColor: group.color || 'var(--bs-secondary)',
                            }}
                            className="ms-2"
                          >
                            {groupVMs.length} VMs
                          </Badge>
                          {group.description && (
                            <small className="text-muted ms-2">
                              {group.description}
                            </small>
                          )}
                        </div>
                        {isAdmin() && (
                          <div className="d-flex" onClick={e => e.stopPropagation()}>
                            <Button
                              variant="link"
                              className="p-1 me-1"
                              onClick={() => handleEditGroup(group)}
                              disabled={loading}
                              title="Edit Group"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-primary" />
                            </Button>
                            <Button
                              variant="link"
                              className="p-1"
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              disabled={loading}
                              title="Delete Group"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-danger" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      {groupVMs.length === 0 ? (
                        <Alert variant="info">
                          No VMs in this group match the current filter.
                        </Alert>
                      ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                          {groupVMs.map(vm => renderVMCard(vm))}
                        </Row>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}

          {/* Display Ungrouped VMs */}
          {(filterGroupId === 'all' || filterGroupId === 'ungrouped') && (
            <div className="mb-4">
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faServer} className="me-2 text-secondary" />
                Ungrouped VMs
              </h5>
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredVMs.filter(vm => !vm.group_id).map(vm => renderVMCard(vm))}
              </Row>
            </div>
          )}
        </div>
      )}

      <VMModal
        show={showVMModal}
        onHide={() => setShowVMModal(false)}
        vm={currentVM}
        serviceTypes={serviceTypes}
        vmGroups={vmGroups}
        onSave={handleSaveVM}
        loading={loading}
      />

      <VMGroupModal
        show={showGroupModal}
        onHide={() => setShowGroupModal(false)}
        group={currentGroup}
        onSave={handleSaveGroup}
        loading={loading}
      />

      <BulkMoveModal
        show={showBulkMoveModal}
        onHide={() => setShowBulkMoveModal(false)}
        selectedVMs={selectedVMs}
        vmGroups={vmGroups}
        onMove={executeBulkMove}
        loading={loading && operationType === 'move_vms'}
      />
    </div>
  );
};

export default Dashboard;
