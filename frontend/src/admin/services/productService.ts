// productService: CRUD for products
const API = '/api/products';
export const productService = {
  getAll: async () => {
    const res = await fetch(API, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  add: async (product: any) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
  },
  update: async (id: number, product: any) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },
  delete: async (id: number) => {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return id;
  },
  toggleActive: async (id: number, enable: boolean) => {
    const res = await fetch(`${API}/${id}/enable?enable=${enable}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to toggle product');
    return res.json();
  },
  get: async (id: number) => {
    const res = await fetch(`${API}/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },
};
