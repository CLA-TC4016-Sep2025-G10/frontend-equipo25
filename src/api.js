const ragBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.equipo25.edu/rag';
const authBaseUrl = process.env.REACT_APP_AUTH_BASE_URL || ragBaseUrl;
const registerBaseUrl = process.env.REACT_APP_REGISTER_BASE_URL || authBaseUrl;

const buildError = async (response) => {
  let message = 'Error en la solicitud';
  try {
    const data = await response.json();
    message = data.message || data.error || message;
  } catch {
    // ignore
  }
  const error = new Error(message);
  error.status = response.status;
  return error;
};

const request = async (baseUrl, path, { method = 'GET', token, body, headers = {}, skipJson = false } = {}) => {
  const finalHeaders = { ...headers };
  let payload = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && body !== undefined && body !== null) {
    if (typeof body !== 'string') {
      payload = JSON.stringify(body);
    }
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: payload
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  if (skipJson || response.status === 204) {
    return null;
  }

  return response.json();
};

// Auth endpoints
export const loginRequest = (credentials) =>
  request(authBaseUrl, '/login', { method: 'POST', body: credentials });

export const fetchCurrentUser = (token) =>
  request(ragBaseUrl, '/users/me', { token });

export const logoutRequest = (token) =>
  request(ragBaseUrl, '/auth/logout', { method: 'POST', token, skipJson: true });

export const registerUser = (payload) =>
  request(registerBaseUrl, '/register', { method: 'POST', body: payload });

// RAG endpoints
export const listDocuments = (token) =>
  request(ragBaseUrl, '/rag/documents', { token });

export const uploadDocumentRequest = (formData, token) =>
  request(ragBaseUrl, '/rag/documents', { method: 'POST', body: formData, token });

export const queryRag = (payload, token) =>
  request(ragBaseUrl, '/rag/query', { method: 'POST', body: payload, token });

export const streamRagQuery = (payload, token) =>
  fetch(`${ragBaseUrl}/rag/query/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

// Legacy personajes helpers preserved for compatibility
export const getAllPersonajes = () =>
  request(ragBaseUrl, '/personajes');

export const getPersonajeById = (id) =>
  request(ragBaseUrl, `/personajes/${id}`);

export const createPersonaje = (personaje) =>
  request(ragBaseUrl, '/personajes', { method: 'POST', body: personaje });

export const updatePersonaje = (id, personaje) =>
  request(ragBaseUrl, `/personajes/${id}`, { method: 'PUT', body: personaje });

export const deletePersonaje = (id) =>
  request(ragBaseUrl, `/personajes/${id}`, { method: 'DELETE' });

export { ragBaseUrl as apiBaseUrl, request };
