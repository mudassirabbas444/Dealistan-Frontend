import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/auth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from auth service
      const token = authService.getToken();
      
      if (token) {
        // Socket.IO should connect to the server root, not the API endpoint
        const socketUrl = process.env.REACT_APP_API_URL 
          ? process.env.REACT_APP_API_URL.replace('/api', '') 
          : 'http://localhost:5000';
          
        console.log('Socket token available:', !!token);
        console.log('Socket connecting to:', socketUrl);
        
        // Initialize socket connection
        const newSocket = io(socketUrl, {
          auth: {
            token
          },
          transports: ['websocket']
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('Connected to WebSocket server');
          setIsConnected(true);
          newSocket.emit('user_online');
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        // Message event handlers
         newSocket.on('receive_message', (data) => {
          console.log('Received message:', data);
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
          // You can emit a custom event here to notify components
          window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
          // Ensure scroll advances after async state updates
          setTimeout(() => {
             window.dispatchEvent(new Event('messagesScrollToBottom'));
          }, 0);
        });

         // Sent confirmation (echo back to sender)
         newSocket.on('message_sent', (data) => {
           console.log('Message sent (echo):', data);
           window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
           setTimeout(() => {
             window.dispatchEvent(new Event('messagesScrollToBottom'));
           }, 0);
         });

        newSocket.on('unread_count_update', (data) => {
          console.log('Unread count updated:', data);
          setUnreadCount(data.unreadCount);
        });

        newSocket.on('user_typing', (data) => {
          console.log('User typing:', data);
          window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
        });

        newSocket.on('user_status_change', (data) => {
          console.log('User status changed:', data);
          window.dispatchEvent(new CustomEvent('userStatusChange', { detail: data }));
        });

        newSocket.on('messages_read', (data) => {
          console.log('Messages read:', data);
          window.dispatchEvent(new CustomEvent('messagesRead', { detail: data }));
        });

        setSocket(newSocket);

        // Cleanup function
        return () => {
          newSocket.close();
          setSocket(null);
          setIsConnected(false);
        };
      }
    } else {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated, user]);

  // Function to send a message
  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    } else {
      console.error('Socket not connected');
    }
  };

  // Function to mark messages as read
  const markAsRead = (senderId) => {
    if (socket && isConnected) {
      socket.emit('mark_as_read', { senderId });
    }
  };

  // Function to send typing indicators
  const sendTypingStart = (receiverId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { receiverId, conversationId });
    }
  };

  const sendTypingStop = (receiverId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { receiverId, conversationId });
    }
  };

  const value = {
    socket,
    isConnected,
    unreadCount,
    sendMessage,
    markAsRead,
    sendTypingStart,
    sendTypingStop,
    setUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
