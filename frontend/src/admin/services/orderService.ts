// orderService: CRUD for orders
const API = '/api/orders';
export const orderService = {
  getAll: async () => {
    const res = await fetch(`${API}/admin`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },
  updateStatus: async (id: number, status: string) => {
    const res = await fetch(`${API}/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },
  cancel: async (id: number) => {
    return orderService.updateStatus(id, 'Cancelled');
  },
};
