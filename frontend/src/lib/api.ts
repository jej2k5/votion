import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Workspace API
export const workspaceApi = {
  list: () => api.get('/workspaces'),
  create: (data: { name: string; icon?: string }) =>
    api.post('/workspaces', data),
  getById: (id: string) => api.get(`/workspaces/${id}`),
  update: (id: string, data: { name?: string; icon?: string }) =>
    api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  addMember: (id: string, data: { email: string; role?: string }) =>
    api.post(`/workspaces/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/workspaces/${id}/members/${userId}`),
};

// Page API
export const pageApi = {
  list: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/pages`),
  create: (workspaceId: string, data: { title?: string; icon?: string; parentId?: string }) =>
    api.post(`/workspaces/${workspaceId}/pages`, data),
  getById: (id: string) => api.get(`/pages/${id}`),
  update: (id: string, data: { title?: string; icon?: string; coverUrl?: string; parentId?: string; position?: number }) =>
    api.patch(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
  restore: (id: string) => api.post(`/pages/${id}/restore`),
};

// Block API
export const blockApi = {
  list: (pageId: string) => api.get(`/pages/${pageId}/blocks`),
  create: (pageId: string, data: { type: string; content?: object; properties?: object; parentBlockId?: string; position?: number }) =>
    api.post(`/pages/${pageId}/blocks`, data),
  update: (id: string, data: { type?: string; content?: object; properties?: object }) =>
    api.patch(`/blocks/${id}`, data),
  delete: (id: string) => api.delete(`/blocks/${id}`),
  move: (id: string, data: { parentBlockId?: string | null; position: number }) =>
    api.post(`/blocks/${id}/move`, data),
};

// Database API
export const databaseApi = {
  getById: (id: string) => api.get(`/databases/${id}`),
  addProperty: (id: string, data: { name: string; type: string; options?: object }) =>
    api.post(`/databases/${id}/properties`, data),
  updateProperty: (id: string, propertyId: string, data: { name?: string; type?: string; options?: object }) =>
    api.patch(`/databases/${id}/properties/${propertyId}`, data),
  deleteProperty: (id: string, propertyId: string) =>
    api.delete(`/databases/${id}/properties/${propertyId}`),
  getRows: (id: string) => api.get(`/databases/${id}/rows`),
  createRow: (id: string, values?: Record<string, unknown>) =>
    api.post(`/databases/${id}/rows`, { values }),
  updateRow: (id: string, rowId: string, values: Record<string, unknown>) =>
    api.patch(`/databases/${id}/rows/${rowId}`, { values }),
  deleteRow: (id: string, rowId: string) =>
    api.delete(`/databases/${id}/rows/${rowId}`),
};
