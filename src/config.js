// Centralized API configuration for both local development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default API_BASE_URL;
