import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faServer,
  faDatabase,
  faCloud,
  faCogs,
  faExchangeAlt,
  faGlobe,
  faCode,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';
import { getVMById } from '../utils/supabaseClient';
import { getServiceTypes } from '../utils/supabaseClient';
import ServiceDetailsSimple from './ServiceDetailsSimple';
import LoadingSpinner from './LoadingSpinner';

const ServiceDetailsPage = () => {
  const { vmId, serviceId } = useParams();
  const [vm, setVm] = useState(null);
  const [service, setService] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Loading VM with ID:', vmId);
        console.log('Looking for service with ID:', serviceId);

        // Load VM data
        const { data: vmData, error: vmError } = await getVMById(vmId);

        if (vmError) {
          console.error('Error loading VM:', vmError);
          setError('Failed to load VM details. Please try again later.');
          return;
        }

        if (!vmData) {
          console.error('VM not found');
          setError('VM not found.');
          return;
        }

        console.log('VM data loaded:', vmData);
        setVm(vmData);

        // Find the specific service
        const foundService = vmData.services.find(s => s.id.toString() === serviceId.toString());

        if (!foundService) {
          console.error('Service not found in VM services:', vmData.services);
          setError('Service not found.');
          return;
        }

        console.log('Service found:', foundService);
        setService(foundService);

        // Load service types
        const { data: serviceTypeData, error: serviceTypeError } = await getServiceTypes();

        if (serviceTypeError) {
          console.error('Error loading service types:', serviceTypeError);
          setError('Failed to load service types. Please try again later.');
          return;
        }

        setServiceTypes(serviceTypeData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (vmId && serviceId) {
      loadData();
    }
  }, [vmId, serviceId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Function to get the appropriate icon for a service
  const getServiceIcon = (serviceName) => {
    if (!serviceName) return faServer;

    const name = serviceName.toLowerCase();

    if (name.includes('db') || name.includes('database') || name.includes('sql')) {
      return faDatabase;
    } else if (name.includes('cloud')) {
      return faCloud;
    } else if (name.includes('management') || name.includes('admin')) {
      return faCogs;
    } else if (name.includes('migration') || name.includes('transfer')) {
      return faExchangeAlt;
    } else if (name.includes('web') || name.includes('http')) {
      return faGlobe;
    } else if (name.includes('app') || name.includes('application')) {
      return faCode;
    } else if (name.includes('network')) {
      return faNetworkWired;
    } else {
      return faServer;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading service details..." />;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!vm || !service) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Service not found.</Alert>
        <Button variant="primary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // We now only need the service and VM hostname

  return (
    <Container className="mt-4">
      <Button variant="outline-primary" onClick={handleBack} className="mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back to Dashboard
      </Button>

      <div className="service-page-header mb-4">
        <h2>
          <FontAwesomeIcon icon={getServiceIcon(service.name)} className="me-2 text-primary" />
          {service.name}
        </h2>
        <p className="text-muted">
          Service on VM <strong>{vm.hostname}</strong>
        </p>
      </div>

      <ServiceDetailsSimple service={service} serviceTypes={serviceTypes} />
    </Container>
  );
};

export default ServiceDetailsPage;
