import initialVMData from '../data/vms.json';

// Initialize VMs in localStorage if not already present
const initializeVMs = () => {
  if (!localStorage.getItem('vms')) {
    localStorage.setItem('vms', JSON.stringify(initialVMData.vms));
  }
  return getVMs();
};

// Initialize service types in localStorage if not already present
const initializeServiceTypes = () => {
  if (!localStorage.getItem('serviceTypes')) {
    localStorage.setItem('serviceTypes', JSON.stringify(initialVMData.serviceTypes));
  }
  return getServiceTypes();
};

// Get all VMs from localStorage
const getVMs = () => {
  const vms = localStorage.getItem('vms');
  return vms ? JSON.parse(vms) : [];
};

// Get all service types from localStorage
const getServiceTypes = () => {
  const serviceTypes = localStorage.getItem('serviceTypes');
  return serviceTypes ? JSON.parse(serviceTypes) : [];
};

// Save VMs to localStorage
const saveVMs = (vms) => {
  localStorage.setItem('vms', JSON.stringify(vms));
};

// Get a VM by ID
const getVMById = (id) => {
  const vms = getVMs();
  return vms.find(vm => vm.id === id);
};

// Add a new VM
const addVM = (vm) => {
  const vms = getVMs();
  const newVM = {
    ...vm,
    id: vms.length > 0 ? Math.max(...vms.map(v => v.id)) + 1 : 1
  };
  vms.push(newVM);
  saveVMs(vms);
  return newVM;
};

// Update an existing VM
const updateVM = (updatedVM) => {
  const vms = getVMs();
  const index = vms.findIndex(vm => vm.id === updatedVM.id);
  
  if (index !== -1) {
    vms[index] = updatedVM;
    saveVMs(vms);
    return updatedVM;
  }
  
  return null;
};

// Delete a VM
const deleteVM = (vmId) => {
  const vms = getVMs();
  const filteredVMs = vms.filter(vm => vm.id !== vmId);
  
  if (filteredVMs.length < vms.length) {
    saveVMs(filteredVMs);
    return true;
  }
  
  return false;
};

export {
  initializeVMs,
  initializeServiceTypes,
  getVMs,
  getServiceTypes,
  getVMById,
  addVM,
  updateVM,
  deleteVM
};
