import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faSave, faPalette } from '@fortawesome/free-solid-svg-icons';

const VMGroupModal = ({ show, onHide, group, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6c757d' // Default gray
  });

  // Predefined color options
  const colorOptions = [
    { value: '#3498db', name: 'Blue' },
    { value: '#e74c3c', name: 'Red' },
    { value: '#2ecc71', name: 'Green' },
    { value: '#f39c12', name: 'Orange' },
    { value: '#9b59b6', name: 'Purple' },
    { value: '#1abc9c', name: 'Teal' },
    { value: '#34495e', name: 'Dark Blue' },
    { value: '#6c757d', name: 'Gray' }
  ];

  // Initialize form data when group changes
  useEffect(() => {
    if (group) {
      setFormData({
        ...group,
        color: group.color || '#6c757d' // Ensure color has a default
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6c757d' // Default gray
      });
    }
  }, [group]);

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

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
          {group ? 'Edit Group' : 'Create VM Group'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter group description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <FontAwesomeIcon icon={faPalette} className="me-2" />
              Group Color
            </Form.Label>
            <Row>
              {colorOptions.map((color) => (
                <Col key={color.value} xs={3} className="mb-2">
                  <div
                    className={`color-option p-2 rounded ${formData.color === color.value ? 'border border-primary' : 'border'}`}
                    style={{
                      backgroundColor: color.value,
                      cursor: 'pointer',
                      height: '40px'
                    }}
                    onClick={() => setFormData({...formData, color: color.value})}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <div className="text-center text-white">
                        <FontAwesomeIcon icon={faLayerGroup} />
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
            <Form.Text className="text-muted">
              Select a color for this group. This will be used to visually identify the group.
            </Form.Text>
          </Form.Group>
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
  );
};

export default VMGroupModal;
