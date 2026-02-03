import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGkI-mkucmWRH8jmwjkCL0ALQrMblTFw4",
  authDomain: "realestate-investment-analyzer.firebaseapp.com",
  projectId: "realestate-investment-analyzer",
  storageBucket: "realestate-investment-analyzer.firebasestorage.app",
  messagingSenderId: "912317025442",
  appId: "1:912317025442:web:cf1e193e659ab44c115bfb",
  measurementId: "G-ZLMHQN43TJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const perf = getPerformance(app);

export default app;
