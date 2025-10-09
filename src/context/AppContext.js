import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: 'light',
  language: 'en',
  notifications: [],
  sidebarOpen: false,
  searchQuery: '',
  filters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
  },
};

// Action types
export const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  LOGOUT: 'LOGOUT',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };

    case ACTION_TYPES.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
      };

    case ACTION_TYPES.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      };

    case ACTION_TYPES.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };

    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };

    case ACTION_TYPES.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case ACTION_TYPES.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case ACTION_TYPES.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          category: '',
          minPrice: '',
          maxPrice: '',
          condition: '',
          location: '',
        },
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        notifications: [],
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          if (userData) {
            dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
          }
        }

        // Load theme from localStorage
        const savedTheme = localStorage.getItem('dealistaan_theme');
        if (savedTheme) {
          dispatch({ type: ACTION_TYPES.SET_THEME, payload: savedTheme });
        }

        // Load language from localStorage
        const savedLanguage = localStorage.getItem('dealistaan_language');
        if (savedLanguage) {
          dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: savedLanguage });
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    };

    initializeApp();
  }, []);

  // Actions
  const actions = {
    setLoading: (isLoading) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: isLoading });
    },

    setUser: (user) => {
      dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
    },

    setAuthenticated: (isAuthenticated) => {
      dispatch({
        type: ACTION_TYPES.SET_AUTHENTICATED,
        payload: isAuthenticated,
      });
    },

    setTheme: (theme) => {
      localStorage.setItem('dealistaan_theme', theme);
      dispatch({ type: ACTION_TYPES.SET_THEME, payload: theme });
    },

    setLanguage: (language) => {
      localStorage.setItem('dealistaan_language', language);
      dispatch({ type: ACTION_TYPES.SET_LANGUAGE, payload: language });
    },

    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      const notificationWithId = {
        id,
        timestamp: Date.now(),
        ...notification,
      };
      dispatch({
        type: ACTION_TYPES.ADD_NOTIFICATION,
        payload: notificationWithId,
      });

      // Auto-remove notification after 5 seconds
      if (notification.type !== 'error') {
        setTimeout(() => {
          actions.removeNotification(id);
        }, 5000);
      }
    },

    removeNotification: (id) => {
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
    },

    clearNotifications: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_NOTIFICATIONS });
    },

    toggleSidebar: () => {
      dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR });
    },

    setSearchQuery: (query) => {
      dispatch({ type: ACTION_TYPES.SET_SEARCH_QUERY, payload: query });
    },

    setFilters: (filters) => {
      dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
    },

    clearFilters: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_FILTERS });
    },

    logout: () => {
      authService.logout();
      dispatch({ type: ACTION_TYPES.LOGOUT });
    },

    login: (userData) => {
      dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
      actions.addNotification({
        type: 'success',
        title: 'Welcome!',
        message: 'You have been logged in successfully.',
      });
    },

    register: (userData) => {
      dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
      actions.addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Your account has been created successfully.',
      });
    },
  };

  const value = {
    ...state,
    ...actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export context for advanced usage
export { AppContext };
