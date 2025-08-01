'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { mockEvents } from '../utils/mockData';

// Initial state
const initialState = {
  // Events
  events: [],
  currentEvent: null,
  
  // Loading states
  isLoading: false,
  isEventsLoading: false,
  isEventLoading: false,
  
  // User state
  user: null,
  isAuthenticated: false,
  
  // UI state
  notifications: [],
  modals: {
    rsvp: { isOpen: false, eventId: null },
    createEvent: { isOpen: false },
    confirmDialog: { isOpen: false, data: null }
  },
  
  // Error states
  error: null,
  eventError: null,
  
  // Filters and search
  searchTerm: '',
  eventFilters: {
    category: 'all',
    dateRange: 'upcoming',
    location: 'all'
  }
};

// Action types
const ActionTypes = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_EVENTS_LOADING: 'SET_EVENTS_LOADING',
  SET_EVENT_LOADING: 'SET_EVENT_LOADING',
  
  // Event actions
  SET_EVENTS: 'SET_EVENTS',
  SET_CURRENT_EVENT: 'SET_CURRENT_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  
  // RSVP actions
  ADD_RSVP: 'ADD_RSVP',
  REMOVE_RSVP: 'REMOVE_RSVP',
  UPDATE_ATTENDANCE: 'UPDATE_ATTENDANCE',
  
  // User actions
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Modal actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  SET_EVENT_ERROR: 'SET_EVENT_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  
  // Search and filter actions
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_EVENT_FILTERS: 'SET_EVENT_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_EVENTS_LOADING:
      return { ...state, isEventsLoading: action.payload };
      
    case ActionTypes.SET_EVENT_LOADING:
      return { ...state, isEventLoading: action.payload };
      
    case ActionTypes.SET_EVENTS:
      return { ...state, events: action.payload, error: null };
      
    case ActionTypes.SET_CURRENT_EVENT:
      return { ...state, currentEvent: action.payload, eventError: null };
      
    case ActionTypes.ADD_EVENT:
      return { 
        ...state, 
        events: [...state.events, action.payload],
        error: null 
      };
      
    case ActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.id 
          ? action.payload 
          : state.currentEvent
      };
      
    case ActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        currentEvent: state.currentEvent?.id === action.payload 
          ? null 
          : state.currentEvent
      };
      
    case ActionTypes.ADD_RSVP:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.eventId 
            ? {
                ...event,
                attendees: [...event.attendees, action.payload.attendee],
                currentAttendees: event.currentAttendees + 1
              }
            : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.eventId
          ? {
              ...state.currentEvent,
              attendees: [...state.currentEvent.attendees, action.payload.attendee],
              currentAttendees: state.currentEvent.currentAttendees + 1
            }
          : state.currentEvent
      };
      
    case ActionTypes.REMOVE_RSVP:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.eventId 
            ? {
                ...event,
                attendees: event.attendees.filter(a => a.address !== action.payload.userAddress),
                currentAttendees: event.currentAttendees - 1
              }
            : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.eventId
          ? {
              ...state.currentEvent,
              attendees: state.currentEvent.attendees.filter(a => a.address !== action.payload.userAddress),
              currentAttendees: state.currentEvent.currentAttendees - 1
            }
          : state.currentEvent
      };
      
    case ActionTypes.UPDATE_ATTENDANCE:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.eventId 
            ? {
                ...event,
                attendees: event.attendees.map(attendee =>
                  attendee.id === action.payload.attendeeId
                    ? { ...attendee, hasAttended: action.payload.hasAttended }
                    : attendee
                )
              }
            : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.eventId
          ? {
              ...state.currentEvent,
              attendees: state.currentEvent.attendees.map(attendee =>
                attendee.id === action.payload.attendeeId
                  ? { ...attendee, hasAttended: action.payload.hasAttended }
                  : attendee
              )
            }
          : state.currentEvent
      };
      
    case ActionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
      
    case ActionTypes.CLEAR_USER:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false 
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now() + Math.random(),
          ...action.payload,
          timestamp: new Date().toISOString()
        }]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
      
    case ActionTypes.OPEN_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalType]: {
            isOpen: true,
            ...action.payload.data
          }
        }
      };
      
    case ActionTypes.CLOSE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: {
            isOpen: false,
            data: null
          }
        }
      };
      
    case ActionTypes.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: Object.keys(state.modals).reduce((acc, key) => ({
          ...acc,
          [key]: { isOpen: false, data: null }
        }), {})
      };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ActionTypes.SET_EVENT_ERROR:
      return { ...state, eventError: action.payload };
      
    case ActionTypes.CLEAR_ERRORS:
      return { ...state, error: null, eventError: null };
      
    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
      
    case ActionTypes.SET_EVENT_FILTERS:
      return { 
        ...state, 
        eventFilters: { ...state.eventFilters, ...action.payload } 
      };
      
    case ActionTypes.CLEAR_FILTERS:
      return { 
        ...state, 
        searchTerm: '',
        eventFilters: initialState.eventFilters 
      };
      
    default:
      return state;
  }
};

// Create contexts
const AppContext = createContext();
const AppDispatchContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: ActionTypes.SET_EVENTS_LOADING, payload: true });
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch({ type: ActionTypes.SET_EVENTS, payload: mockEvents });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to load events' });
      } finally {
        dispatch({ type: ActionTypes.SET_EVENTS_LOADING, payload: false });
      }
    };

    loadInitialData();
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    state.notifications.forEach(notification => {
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          dispatch({ 
            type: ActionTypes.REMOVE_NOTIFICATION, 
            payload: notification.id 
          });
        }, notification.duration || 5000);
      }
    });
  }, [state.notifications]);

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};

// Custom hooks
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};

// Action creators
export const useAppActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Loading actions
    setLoading: (isLoading) => 
      dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
    
    setEventsLoading: (isLoading) => 
      dispatch({ type: ActionTypes.SET_EVENTS_LOADING, payload: isLoading }),
    
    setEventLoading: (isLoading) => 
      dispatch({ type: ActionTypes.SET_EVENT_LOADING, payload: isLoading }),

    // Event actions
    setEvents: (events) => 
      dispatch({ type: ActionTypes.SET_EVENTS, payload: events }),
    
    setCurrentEvent: (event) => 
      dispatch({ type: ActionTypes.SET_CURRENT_EVENT, payload: event }),
    
    addEvent: (event) => 
      dispatch({ type: ActionTypes.ADD_EVENT, payload: event }),
    
    updateEvent: (event) => 
      dispatch({ type: ActionTypes.UPDATE_EVENT, payload: event }),
    
    deleteEvent: (eventId) => 
      dispatch({ type: ActionTypes.DELETE_EVENT, payload: eventId }),

    // RSVP actions
    addRSVP: (eventId, attendee) => 
      dispatch({ type: ActionTypes.ADD_RSVP, payload: { eventId, attendee } }),
    
    removeRSVP: (eventId, userAddress) => 
      dispatch({ type: ActionTypes.REMOVE_RSVP, payload: { eventId, userAddress } }),
    
    updateAttendance: (eventId, attendeeId, hasAttended) => 
      dispatch({ 
        type: ActionTypes.UPDATE_ATTENDANCE, 
        payload: { eventId, attendeeId, hasAttended } 
      }),

    // User actions
    setUser: (user) => 
      dispatch({ type: ActionTypes.SET_USER, payload: user }),
    
    clearUser: () => 
      dispatch({ type: ActionTypes.CLEAR_USER }),

    // Notification actions
    addNotification: (notification) => 
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    
    removeNotification: (notificationId) => 
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notificationId }),
    
    clearNotifications: () => 
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS }),

    // Modal actions
    openModal: (modalType, data = {}) => 
      dispatch({ type: ActionTypes.OPEN_MODAL, payload: { modalType, data } }),
    
    closeModal: (modalType) => 
      dispatch({ type: ActionTypes.CLOSE_MODAL, payload: modalType }),
    
    closeAllModals: () => 
      dispatch({ type: ActionTypes.CLOSE_ALL_MODALS }),

    // Error actions
    setError: (error) => 
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    setEventError: (error) => 
      dispatch({ type: ActionTypes.SET_EVENT_ERROR, payload: error }),
    
    clearErrors: () => 
      dispatch({ type: ActionTypes.CLEAR_ERRORS }),

    // Search and filter actions
    setSearchTerm: (term) => 
      dispatch({ type: ActionTypes.SET_SEARCH_TERM, payload: term }),
    
    setEventFilters: (filters) => 
      dispatch({ type: ActionTypes.SET_EVENT_FILTERS, payload: filters }),
    
    clearFilters: () => 
      dispatch({ type: ActionTypes.CLEAR_FILTERS })
  };
};

export { ActionTypes };