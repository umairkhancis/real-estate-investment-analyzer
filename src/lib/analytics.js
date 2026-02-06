import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Analytics helper functions

// Page tracking
export const trackPageView = (page) => {
  logEvent(analytics, 'page_view', {
    page_path: page,
    timestamp: new Date().toISOString()
  });
};

export const trackAppLoad = () => {
  logEvent(analytics, 'app_loaded', {
    timestamp: new Date().toISOString()
  });
};

// Calculator tracking
export const trackCalculatorUsed = (calculatorType, inputs) => {
  logEvent(analytics, 'calculator_used', {
    calculator_type: calculatorType, // 'ready' or 'offplan'
    property_price: inputs.propertyPrice || inputs.totalValue,
    property_size: inputs.propertySize,
    timestamp: new Date().toISOString()
  });
};

export const trackCalculatorResult = (calculatorType, recommendation) => {
  logEvent(analytics, 'calculator_result_viewed', {
    calculator_type: calculatorType,
    recommendation: recommendation,
    timestamp: new Date().toISOString()
  });
};

export const trackCalculatorSwitch = (fromType, toType) => {
  logEvent(analytics, 'calculator_switched', {
    from_calculator: fromType,
    to_calculator: toType,
    timestamp: new Date().toISOString()
  });
};

// Chat tracking
export const trackChatOpened = () => {
  logEvent(analytics, 'chat_opened', {
    timestamp: new Date().toISOString()
  });
};

export const trackChatClosed = (duration) => {
  logEvent(analytics, 'chat_closed', {
    session_duration: duration
  });
};

export const trackMessageSent = (message) => {
  // Extract property type from message
  const isReady = /ready/i.test(message);
  const isOffplan = /off-?plan/i.test(message);

  logEvent(analytics, 'message_sent', {
    // message_length: message.length,  // Commented for privacy
    property_type: isReady ? 'ready' : isOffplan ? 'offplan' : 'unknown',
    has_numbers: /\d+/.test(message)
    // NOTE: Actual message content is NOT tracked for user privacy
  });
};

export const trackAnalysisComplete = (propertyType, metrics) => {
  logEvent(analytics, 'analysis_completed', {
    property_type: propertyType,
    npv: metrics.npv,
    irr: metrics.irr,
    recommendation: metrics.recommendation
  });
};

export const trackRateLimitHit = () => {
  logEvent(analytics, 'rate_limit_hit', {
    timestamp: new Date().toISOString()
  });
};

export const trackError = (errorType, errorMessage) => {
  logEvent(analytics, 'error_occurred', {
    error_type: errorType,
    error_message: errorMessage
  });
};

// Set user ID for tracking across sessions
export const identifyUser = (userId) => {
  setUserId(analytics, userId);
};

// Track user properties
export const setUserProps = (properties) => {
  setUserProperties(analytics, properties);
};

export default analytics;
