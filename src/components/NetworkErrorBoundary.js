import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

const NetworkErrorBoundary = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  if (!isOnline && showOfflineMessage) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4'>
              <WifiOff className='h-8 w-8 text-yellow-600' />
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-2'>
              You're Offline
            </h2>
            <p className='text-gray-600 mb-6'>
              Please check your internet connection and try again.
            </p>
            
            <div className='space-y-4'>
              <Button
                onClick={handleRetry}
                disabled={!navigator.onLine}
                className='flex items-center justify-center'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Retry Connection
              </Button>
              
              <div className='text-sm text-gray-500'>
                <p>While offline, you can still:</p>
                <ul className='list-disc list-inside mt-2 space-y-1'>
                  <li>View cached pages</li>
                  <li>Read previously loaded content</li>
                  <li>Use basic navigation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Online/Offline indicator */}
      <div className='fixed bottom-4 right-4 z-50'>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 opacity-0 hover:opacity-100' 
            : 'bg-red-100 text-red-800 opacity-100'
        }`}>
          {isOnline ? (
            <>
              <Wifi className='h-4 w-4' />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className='h-4 w-4' />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NetworkErrorBoundary;
