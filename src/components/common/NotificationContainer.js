import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'error':
        return <XCircle className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
      default:
        return <Info className='h-5 w-5 text-blue-500' />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm'>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out`}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className='flex items-start space-x-3'>
            {getIcon(notification.type)}

            <div className='flex-1 min-w-0'>
              {notification.title && (
                <h4 className='text-sm font-medium text-gray-900 mb-1'>
                  {notification.title}
                </h4>
              )}

              {notification.message && (
                <p className='text-sm text-gray-700'>{notification.message}</p>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className='flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors'
            >
              <X className='h-4 w-4 text-gray-400' />
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;
