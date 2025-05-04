import React, { createContext, useContext, useState } from 'react';

// Create a context for edit mode
const EditModeContext = createContext();

// Custom hook to use the edit mode context
export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};

// Provider component for edit mode
export const EditModeProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    setEditMode(prevMode => !prevMode);
  };

  // Value object to be provided to consumers
  const value = {
    editMode,
    toggleEditMode,
    setEditMode
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};
