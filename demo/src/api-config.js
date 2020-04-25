// Locally the API is always on port 8000. In deployed environments we can safely assume it's
// at the same origin as the UI.
const isLocal = window.location.hostname === 'localhost';
export const API_ROOT = isLocal ? 'http://localhost:8000' : window.location.origin;
