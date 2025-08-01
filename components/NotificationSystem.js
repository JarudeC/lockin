'use client';

import { useEffect } from 'react';
import { useAppState, useAppActions } from '../context/AppContext';

const NotificationContainer = () => {
  const { notifications } = useAppState();
  const { removeNotification } = useAppActions();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const { type = 'info', title, message, duration = 5000, autoRemove = true } = notification;

  useEffect(() => {
    if (autoRemove) {
      const timer = setTimeout(() => {
        onRemove();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoRemove, duration, onRemove]);

  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'text-green-500 hover:text-green-600'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-500 hover:text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-500 hover:text-yellow-600'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-500 hover:text-blue-600'
    }
  };

  const styles = typeStyles[type];

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`
      animate-in slide-in-from-right duration-300
      border rounded-lg shadow-lg p-4 transition-all
      ${styles.container}
    `}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${styles.title}`}>
              {title}
            </p>
          )}
          {message && (
            <p className={`text-sm ${styles.message} ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onRemove}
            className={`
              inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
              ${styles.button}
            `}
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for easy notification usage
export const useNotifications = () => {
  const { addNotification } = useAppActions();

  return {
    success: (title, message, options = {}) => {
      addNotification({
        type: 'success',
        title,
        message,
        ...options
      });
    },
    
    error: (title, message, options = {}) => {
      addNotification({
        type: 'error',
        title,
        message,
        autoRemove: false, // Keep error notifications until manually dismissed
        ...options
      });
    },
    
    warning: (title, message, options = {}) => {
      addNotification({
        type: 'warning',
        title,
        message,
        ...options
      });
    },
    
    info: (title, message, options = {}) => {
      addNotification({
        type: 'info',
        title,
        message,
        ...options
      });
    },

    // Quick methods for common patterns
    rsvpSuccess: (eventName) => {
      addNotification({
        type: 'success',
        title: 'RSVP Confirmed!',
        message: `Successfully RSVP'd to ${eventName}`,
      });
    },

    rsvpError: (error) => {
      addNotification({
        type: 'error',
        title: 'RSVP Failed',
        message: error,
        autoRemove: false
      });
    },

    walletConnected: (address) => {
      addNotification({
        type: 'success',
        title: 'Wallet Connected',
        message: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    },

    walletDisconnected: () => {
      addNotification({
        type: 'info',
        title: 'Wallet Disconnected',
        message: 'Your wallet has been disconnected',
      });
    },

    attendanceUpdated: (attendeeName, hasAttended) => {
      addNotification({
        type: 'success',
        title: 'Attendance Updated',
        message: `${attendeeName || 'Attendee'} marked as ${hasAttended ? 'present' : 'absent'}`,
      });
    },

    eventCreated: (eventName) => {
      addNotification({
        type: 'success',
        title: 'Event Created!',
        message: `${eventName} has been created successfully`,
      });
    },

    networkSwitch: (networkName) => {
      addNotification({
        type: 'info',
        title: 'Network Switched',
        message: `Switched to ${networkName}`,
      });
    },

    transactionPending: (txHash) => {
      addNotification({
        type: 'info',
        title: 'Transaction Pending',
        message: `Transaction ${txHash.slice(0, 10)}... is being processed`,
        autoRemove: false
      });
    },

    transactionSuccess: (txHash) => {
      addNotification({
        type: 'success',
        title: 'Transaction Confirmed',
        message: `Transaction ${txHash.slice(0, 10)}... confirmed on blockchain`,
      });
    },

    transactionError: (error) => {
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: error,
        autoRemove: false
      });
    }
  };
};

export default NotificationContainer;