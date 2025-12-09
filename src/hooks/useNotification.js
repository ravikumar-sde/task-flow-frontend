import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null
  });

  const showNotification = ({ 
    type = 'info', 
    title, 
    message, 
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm 
  }) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      showCancel,
      onConfirm
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Helper methods for different notification types
  const showSuccess = (message, title = 'Success') => {
    showNotification({ type: 'success', title, message });
  };

  const showError = (message, title = 'Error') => {
    showNotification({ type: 'error', title, message });
  };

  const showWarning = (message, title = 'Warning') => {
    showNotification({ type: 'warning', title, message });
  };

  const showInfo = (message, title = 'Information') => {
    showNotification({ type: 'info', title, message });
  };

  const showConfirm = (message, onConfirm, title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel') => {
    showNotification({ 
      type: 'confirm', 
      title, 
      message, 
      confirmText,
      cancelText,
      showCancel: true,
      onConfirm 
    });
  };

  return {
    notification,
    showNotification,
    closeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};

