// The origin (scheme, hostname and port) of the API. Defaults to
// a value that works locally. For deployed environments this is set
// at build time. See: .skiff/cloudbuild-deploy.yaml.
export const API_ROOT = process.env.API_ROOT || 'http://localhost:8000';
