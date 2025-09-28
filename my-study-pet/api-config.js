// Gemini API configuration for browser environment
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Your API key from .env file
const GEMINI_API_KEY = 'AIzaSyDnQixZ726JRP8kSDV8601axJz7FRQM_mI';

console.log('API key loaded:', GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured');

// Make configuration available globally
window.GEMINI_CONFIG = {
    apiUrl: GEMINI_API_URL,
    apiKey: GEMINI_API_KEY,
};
