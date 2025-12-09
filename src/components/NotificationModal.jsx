import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import '../styles/NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  title, 
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} className="notification-icon success" />;
      case 'error':
        return <AlertCircle size={48} className="notification-icon error" />;
      case 'warning':
      case 'confirm':
        return <AlertTriangle size={48} className="notification-icon warning" />;
      case 'info':
      default:
        return <Info size={48} className="notification-icon info" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'confirm':
        return 'Confirm Action';
      case 'info':
      default:
        return 'Information';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (type !== 'confirm') {
        onClose();
      }
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={handleBackdropClick}>
      <div className={`notification-modal ${type}`}>
        <button className="notification-close-btn" onClick={handleCancel}>
          <X size={20} />
        </button>

        <div className="notification-content">
          <div className="notification-icon-wrapper">
            {getIcon()}
          </div>

          <h2 className="notification-title">{getTitle()}</h2>
          
          <p className="notification-message">{message}</p>

          <div className="notification-actions">
            {type === 'confirm' || showCancel ? (
              <>
                <button 
                  className="notification-btn btn-cancel" 
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
                <button 
                  className={`notification-btn btn-confirm ${type === 'confirm' ? 'btn-danger' : ''}`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button 
                className="notification-btn btn-primary" 
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

