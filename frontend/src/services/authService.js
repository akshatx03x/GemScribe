import api from './apiService.js';

export const authService = {
  async googleLogin(userData) {
    const response = await api.post('/auth/google-login', userData);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getRepos() {
    const response = await api.get('/auth/repos');
    return response.data;
  },
};
