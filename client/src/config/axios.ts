import axios from 'axios';

// Configure axios base URL based on environment
const getBaseURL = () => {
  // In production (VPS), the server runs on port 3001
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:3001`;
  }
  // In development, use localhost:3001
  return 'http://localhost:3001';
};

axios.defaults.baseURL = getBaseURL();
axios.defaults.timeout = 10000; // 10 second timeout

export default axios;
