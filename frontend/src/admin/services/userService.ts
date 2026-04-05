import API from '../../api';

// userService: CRUD for users
const API_PATH = '/admin/users';
export const userService = {
  getAll: async () => {
    try {
      const res = await API.get(API_PATH);
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || error?.message || 'Failed to fetch users');
    }
  },
  toggle: async (id: number) => {
    try {
      const res = await API.put(`${API_PATH}/${id}/toggle`);
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || error?.message || 'Failed to toggle user status');
    }
  },
  delete: async (id: number) => {
    try {
      const res = await API.delete(`${API_PATH}/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || error?.message || 'Failed to delete user');
    }
  },
  changeRole: async (id: number, role: 'admin' | 'user') => {
    try {
      const res = await API.put(`${API_PATH}/${id}/role`, { role });
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || error?.message || 'Failed to change user role');
    }
  },
};
