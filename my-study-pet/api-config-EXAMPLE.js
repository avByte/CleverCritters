//Gemini API configuration for browser environment
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

//API key
const GEMINI_API_KEY = 'EXAMPLE';

console.log('API key loaded:', GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured');

//Make configuration available globally
window.GEMINI_CONFIG = {
    apiUrl: GEMINI_API_URL,
    apiKey: GEMINI_API_KEY,
};
