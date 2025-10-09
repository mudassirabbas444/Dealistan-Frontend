import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  ChevronLeft,
  Clock,
  CheckCircle,
  User,
  Package,
  AlertCircle,
  Shield
} from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/message';
import { formatRelativeTime } from '../../utils';
import toast from 'react-hot-toast';
import { VALIDATION } from '../../constants';
import { sanitizeInput } from '../../utils/security';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, sendMessage, markAsRead, sendTypingStart, sendTypingStop } = useSocket();
  const queryClient = useQueryClient();
  const { conversationId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get('user');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [messageErrors, setMessageErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversations
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await messageService.getConversations();
      const raw = response?.data?.conversations || response.data?.data?.conversations || [];
      // Normalize to UI shape
      return raw.map((c) => ({
        otherUser: c?.otherUser || { _id: c?._id, name: c?.otherUser?.name || 'User' },
        product: c?.lastMessage?.product || c.productInfo?.[0] || null,
        latestMessage: c.lastMessage,
        unreadCount: c.unreadCount || 0,
      }));
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Auto-select conversation when arriving with ?user= param
  useEffect(() => {
    if (Array.isArray(conversations) && targetUserId && !selectedConversation) {
      const match = conversations.find(c => c.otherUser?._id === targetUserId);
      if (match) setSelectedConversation(match);
    }
  }, [conversations, targetUserId, selectedConversation]);

  // Fetch messages for selected conversation
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', selectedConversation?.otherUser?._id],
    queryFn: async () => {
      if (!selectedConversation?.otherUser?._id) return [];
      const response = await messageService.getMessagesBetweenUsers(
        selectedConversation.otherUser._id
      );
      return response.data?.messages || response.data?.data?.messages || [];
    },
    enabled: !!selectedConversation?.otherUser?._id,
    refetchInterval: selectedConversation ? 2000 : false
  });

  // Scroll only the messages container to bottom
  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen to global scroll event trigger (from socket)
  useEffect(() => {
    const handler = () => scrollToBottom();
    window.addEventListener('messagesScrollToBottom', handler);
    return () => window.removeEventListener('messagesScrollToBottom', handler);
  }, []);

  // Real-time message handling
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { message } = event.detail;
      // If no conversation selected but URL targets this user, try auto-select
      if (!selectedConversation && targetUserId) {
        const match = (conversations || []).find(c => c.otherUser?._id === targetUserId);
        if (match) setSelectedConversation(match);
      }
      
      // If the message is for the current conversation, add it to the messages
      if (selectedConversation && 
          (message.sender._id === selectedConversation.otherUser._id || 
           message.receiver._id === selectedConversation.otherUser._id)) {
        
        // Mark message as read if we're viewing this conversation
        markAsRead(message.sender._id);
        
        // Optimistically update cache for instant UI update
        queryClient.setQueryData(['messages', selectedConversation.otherUser._id], (prev) => {
          const arr = Array.isArray(prev) ? prev.slice() : [];
          if (!arr.find((m) => String(m._id) === String(message._id))) {
            arr.push(message);
          }
          return arr;
        });
        setTimeout(() => scrollToBottom(), 0);
      }
      
      // Refetch conversations to update the last message
      refetchConversations();
    };

    const handleUserTyping = (event) => {
      const { userId, conversationId: typingConversationId, isTyping: userIsTyping } = event.detail;
      
      if (selectedConversation && 
          (typingConversationId === selectedConversation._id || 
           userId === selectedConversation.otherUser._id)) {
        
        if (userIsTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== userId));
        }
      }
    };

    const handleMessagesRead = (event) => {
      // Update read status for messages
      refetchMessages();
    };

    // Add event listeners
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('userTyping', handleUserTyping);
    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('userTyping', handleUserTyping);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [selectedConversation, refetchMessages, refetchConversations, markAsRead]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setNewMessage('');
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    // Validate message content
    const sanitizedContent = sanitizeInput(newMessage.trim());
    if (sanitizedContent.length === 0) {
      toast.error('Message cannot be empty');
      return;
    }

    if (sanitizedContent.length > 1000) {
      toast.error('Message must be less than 1000 characters');
      return;
    }

    setIsSending(true);
    setMessageErrors({});

    try {
      // Stop typing indicator
      if (isTyping) {
        sendTypingStop(selectedConversation.otherUser._id, selectedConversation._id);
        setIsTyping(false);
      }

      const response = await messageService.sendMessage({
        receiver: selectedConversation.otherUser._id,
        product: selectedConversation.product?._id,
        content: sanitizedContent
      });

      if (!response.success) {
        toast.error('Message may not have been delivered');
        if (response.errors) {
          setMessageErrors(response.errors);
        }
      } else {
        // Clear message input on success
        setNewMessage('');
        
        // Optimistically notify UI of new message so it appears instantly
        const created = response.message || response.data?.messageData || response.data?.message;
        if (created) {
          window.dispatchEvent(new CustomEvent('newMessage', { detail: { message: created } }));
        }
        // Refresh sidebar recency
        refetchConversations();
        // Scroll container to bottom after send
        setTimeout(() => scrollToBottom(), 0);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.response?.data?.errors) {
        setMessageErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedConversation, isSending, isTyping, sendTypingStop, refetchConversations]);

  const handleMarkAsRead = async (senderId) => {
    try {
      // Use WebSocket to mark as read
      markAsRead(senderId);
      await messageService.markAsRead(senderId);
      refetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle typing indicators
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      sendTypingStart(selectedConversation.otherUser._id, selectedConversation._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingStop(selectedConversation.otherUser._id, selectedConversation._id);
      }
    }, 1000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const conversationsArray = Array.isArray(conversations) ? conversations : [];
  const filteredConversations = conversationsArray.filter(conversation =>
    conversation.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Messages</h1>
          <p className='text-gray-600 mb-8'>Please login to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      <div className='flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]'>
        {/* Conversations Sidebar */}
        <div className='lg:w-1/3 bg-white rounded-lg shadow-soft overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-gray-900'>Messages</h2>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-500'>
                  {conversationsArray.length} conversations
                </span>
              </div>
            </div>

            {/* Search */}
            <div className='relative'>
              <Input
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className='h-4 w-4 text-gray-400' />}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className='flex-1 overflow-y-auto'>
            {conversationsLoading ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner />
              </div>
            ) : conversationsError ? (
              <div className='text-center py-8 px-6'>
                <p className='text-red-600 mb-4'>Error loading conversations</p>
                <Button onClick={() => refetchConversations()}>Retry</Button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className='text-center py-8 px-6'>
                <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-600 mb-4'>
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
                <p className='text-sm text-gray-500'>
                  Start a conversation by contacting a seller
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.otherUser._id}
                    conversation={conversation}
                    isSelected={selectedConversation?.otherUser?._id === conversation.otherUser._id}
                    onClick={() => {
                      handleConversationSelect(conversation);
                      handleMarkAsRead(conversation.otherUser._id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className='lg:w-2/3 bg-white rounded-lg shadow-soft overflow-hidden'>
          {!selectedConversation ? (
            <div className='flex items-center justify-center h-full'>
      <div className='text-center'>
                <MessageCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Select a conversation
                </h3>
                <p className='text-gray-600'>
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          ) : (
            <div className='flex flex-col h-full'>
              {/* Chat Header */}
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className='lg:hidden p-2 hover:bg-gray-100 rounded-lg'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>
                  
                  <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
                    <span className='text-primary-600 font-semibold'>
                      {selectedConversation.otherUser.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-900'>
                      {selectedConversation.otherUser.name}
                    </h3>
                    {selectedConversation.product && (
                      <p className='text-sm text-gray-600 flex items-center gap-1'>
                        <Package className='h-3 w-3' />
                        {selectedConversation.product.title}
                      </p>
                    )}
                  </div>
                  
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <MoreVertical className='h-5 w-5 text-gray-400' />
                  </button>
                </div>
              </div>

              {/* Messages */}
               <div ref={messagesContainerRef} className='flex-1 overflow-y-auto p-6 space-y-4'>
                {messagesLoading ? (
                  <div className='flex justify-center py-8'>
                    <LoadingSpinner />
                  </div>
                ) : messagesError ? (
                  <div className='text-center py-8'>
                    <p className='text-red-600 mb-4'>Error loading messages</p>
                    <Button onClick={() => refetchMessages()}>Retry</Button>
                  </div>
                ) : (Array.isArray(messages) && messages.length === 0) ? (
                  <div className='text-center py-8'>
                    <p className='text-gray-600'>No messages yet</p>
                    <p className='text-sm text-gray-500 mt-2'>
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : Array.isArray(messages) ? (
                  messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isCurrentUser={message.sender?._id === user?.id}
                    />
                  ))
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className='px-6 py-2 text-sm text-gray-500 italic border-t border-gray-200'>
                  {typingUsers.length === 1 
                    ? `${selectedConversation.otherUser.name} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                  <span className='inline-block animate-pulse ml-1'>•</span>
                </div>
              )}

              {/* Message Input */}
              <div className='p-6 border-t border-gray-200'>
                {/* Message Errors */}
                {Object.keys(messageErrors).length > 0 && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
                    <div className='flex items-center mb-1'>
                      <AlertCircle className='h-4 w-4 text-red-600 mr-2' />
                      <span className='text-sm font-medium text-red-800'>
                        Message Error:
                      </span>
                    </div>
                    <ul className='text-sm text-red-700 list-disc list-inside'>
                      {Object.entries(messageErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className='flex gap-4'>
                  <Input
                    placeholder='Type a message...'
                    value={newMessage}
                    onChange={handleTyping}
                    className='flex-1'
                    maxLength={1000}
                    disabled={isSending}
                  />
                  <Button
                    type='submit'
                    disabled={!newMessage.trim() || isSending}
                    loading={isSending}
                    className='px-6'
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </form>
                
                {/* Character count */}
                {newMessage.length > 800 && (
                  <div className='text-xs text-gray-500 mt-2 text-right'>
                    {newMessage.length}/1000 characters
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Conversation Item Component
const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const latestMessage = conversation.latestMessage;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
      }`}
      onClick={onClick}
    >
      <div className='flex items-start gap-3'>
        <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0'>
          <span className='text-primary-600 font-semibold text-sm'>
            {conversation.otherUser.name?.charAt(0) || 'U'}
          </span>
        </div>
        
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <h4 className={`text-sm font-medium truncate ${
              hasUnread ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {conversation.otherUser.name}
            </h4>
            {latestMessage && (
              <span className='text-xs text-gray-500'>
                {formatRelativeTime(latestMessage.createdAt)}
              </span>
            )}
          </div>
          
          {conversation.product && (
            <p className='text-xs text-gray-500 truncate mb-1'>
              {conversation.product.title}
            </p>
          )}
          
          {latestMessage && (
            <p className={`text-sm truncate ${
              hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
            }`}>
              {latestMessage.content}
            </p>
          )}
        </div>
        
        {hasUnread && (
          <div className='w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1' />
        )}
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className='text-sm'>{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span>{formatRelativeTime(message.createdAt)}</span>
          {isCurrentUser && message.isRead ? (
            <CheckCircle className='h-3 w-3 text-blue-100' />
          ) : (
            <Clock className='h-3 w-3' />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
