import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import VMGroupSelector from './VMGroupSelector';

const BulkMoveModal = ({ 
  show, 
  onHide, 
  selectedVMs = [], 
  vmGroups = [], 
  onMove, 
  loading = false 
}) => {
  const [targetGroupId, setTargetGroupId] = useState(null);

  const handleMove = () => {
    onMove(selectedVMs.map(vm => vm.id), targetGroupId);
  };

  // Get the names of selected VMs for display
  const selectedVMNames = selectedVMs.map(vm => vm.name || vm.hostname).join(', ');

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
          Move VMs to Group
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          You are about to move <strong>{selectedVMs.length}</strong> VM{selectedVMs.length !== 1 ? 's' : ''} to a different group.
        </p>
        
        {selectedVMs.length > 0 && (
          <div className="mb-3">
            <strong>Selected VMs:</strong>
            <p className="text-muted">{selectedVMNames}</p>
          </div>
        )}
        
        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
            Target Group
          </Form.Label>
          <VMGroupSelector
            value={targetGroupId}
            onChange={setTargetGroupId}
            vmGroups={vmGroups}
            onCreateGroup={null} // Disable group creation in this context
          />
          <Form.Text className="text-muted">
            Select the group you want to move the selected VMs to. Select "No Group" to remove VMs from their current group.
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleMove} 
          disabled={loading || selectedVMs.length === 0}
        >
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
              Moving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
              Move VMs
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkMoveModal;
