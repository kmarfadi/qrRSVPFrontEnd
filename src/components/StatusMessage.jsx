import React from 'react';

const StatusMessage = ({ type, message }) => {
  const getStatusClass = () => {
    switch (type) {
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      case 'warning':
        return 'status-warning';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '';
    }
  };

  return (
    <div className={`status-message ${getStatusClass()}`}>
      <span>{getStatusIcon()}</span>
      <span>{message}</span>
    </div>
  );
};

export default StatusMessage; 