const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.equipo25.edu/rag';

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

const request = async (path, { method = 'GET', token, body, headers = {}, skipJson = false } = {}) => {
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

  const response = await fetch(`${apiBaseUrl}${path}`, {
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
  request('/auth/login', { method: 'POST', body: credentials });

export const fetchCurrentUser = (token) =>
  request('/users/me', { token });

export const logoutRequest = (token) =>
  request('/auth/logout', { method: 'POST', token, skipJson: true });

export const registerUser = (payload) =>
  request('/users', { method: 'POST', body: payload });

// RAG endpoints
export const listDocuments = (token) =>
  request('/rag/documents', { token });

export const uploadDocumentRequest = (formData, token) =>
  request('/rag/documents', { method: 'POST', body: formData, token });

export const queryRag = (payload, token) =>
  request('/rag/query', { method: 'POST', body: payload, token });

export const streamRagQuery = (payload, token) =>
  fetch(`${apiBaseUrl}/rag/query/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

// Legacy personajes helpers preserved for compatibility
export const getAllPersonajes = () =>
  request('/personajes');

export const getPersonajeById = (id) =>
  request(`/personajes/${id}`);

export const createPersonaje = (personaje) =>
  request('/personajes', { method: 'POST', body: personaje });

export const updatePersonaje = (id, personaje) =>
  request(`/personajes/${id}`, { method: 'PUT', body: personaje });

export const deletePersonaje = (id) =>
  request(`/personajes/${id}`, { method: 'DELETE' });

export { apiBaseUrl, request };
