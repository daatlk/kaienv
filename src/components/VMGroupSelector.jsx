import React, { useState } from 'react';
import { Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const VMGroupSelector = ({ value, onChange, vmGroups = [], onCreateGroup }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const handleCreateGroup = () => {
    if (onCreateGroup && newGroupName.trim()) {
      onCreateGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateModal(false);
    }
  };

  return (
    <>
      <InputGroup>
        <Form.Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        >
          <option value="">No Group</option>
          {vmGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Form.Select>
        {onCreateGroup && (
          <Button 
            variant="outline-secondary"
            onClick={() => setShowCreateModal(true)}
            title="Create new group"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        )}
      </InputGroup>

      {/* Create Group Modal */}
      {onCreateGroup && (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
              Create New VM Group
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              Create Group
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default VMGroupSelector;
