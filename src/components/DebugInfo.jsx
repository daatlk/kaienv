import React, { useState } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';

const DebugInfo = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  // Get all environment variables that start with VITE_
  const envVars = {};
  for (const key in import.meta.env) {
    if (key.startsWith('VITE_')) {
      // Mask sensitive values
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
        envVars[key] = '********';
      } else {
        envVars[key] = import.meta.env[key];
      }
    }
  }
  
  // Add window location info
  const locationInfo = {
    href: window.location.href,
    origin: window.location.origin,
    protocol: window.location.protocol,
    host: window.location.host,
    pathname: window.location.pathname
  };
  
  return (
    <div className="mt-4 mb-4">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setShowDebug(!showDebug)}
        className="mb-2"
      >
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </Button>
      
      {showDebug && (
        <Card className="mt-2">
          <Card.Header>Debug Information</Card.Header>
          <Card.Body>
            <Alert variant="warning">
              <strong>Warning:</strong> This information is for debugging purposes only. 
              Do not share this with anyone.
            </Alert>
            
            <h5>Environment Variables:</h5>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(envVars, null, 2)}
            </pre>
            
            <h5>Window Location:</h5>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(locationInfo, null, 2)}
            </pre>
            
            <h5>User Agent:</h5>
            <pre className="bg-light p-3 rounded">
              {navigator.userAgent}
            </pre>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DebugInfo;
