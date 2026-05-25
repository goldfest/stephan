import api from '../api/axiosClient'

const buildParams = (filters = {}) => {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params[key] = value
    }
  })
  return params
}

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me')
}

export const postsApi = {
  search: (filters) => api.get('/posts', { params: buildParams(filters) }),
  mine: (filters) => api.get('/posts/mine', { params: buildParams(filters) }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (payload) => api.post('/posts', payload),
  update: (id, payload) => api.put(`/posts/${id}`, payload),
  remove: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`)
}

export const commentsApi = {
  search: (filters) => api.get('/comments', { params: buildParams(filters) }),
  byPost: (postId, page = 0, size = 10) => api.get(`/posts/${postId}/comments`, { params: { page, size } }),
  create: (postId, payload) => api.post(`/posts/${postId}/comments`, payload),
  update: (id, payload) => api.put(`/comments/${id}`, payload),
  remove: (id) => api.delete(`/comments/${id}`)
}

export const usersApi = {
  list: () => api.get('/users'),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  remove: (id) => api.delete(`/users/${id}`)
}

export const tagsApi = {
  list: () => api.get('/tags')
}
