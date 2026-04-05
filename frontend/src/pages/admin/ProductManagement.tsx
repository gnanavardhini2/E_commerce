import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Button, TextField, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Pagination, Select, Stack } from '@mui/material';
import API from '../../api';
import { toast } from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  category?: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string;
  active: boolean;
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const BACKEND_ORIGIN = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080/api'
).replace(/\/api\/?$/, '');

const CATEGORY_OPTIONS = [
  'Electronics',
  'Fashion',
  'Accessories',
  'Beauty',
  'Home & Kitchen',
  'Grocery',
  'Footwear',
  'Sports',
  'Books',
  'Other',
];

const resolveImageUrl = (url: string) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return FALLBACK_IMAGE;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  return `${BACKEND_ORIGIN}/${trimmed}`;
};

const ProductManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmToggleId, setConfirmToggleId] = useState<number | null>(null);

  const PAGE_SIZE = 6;

  // Fetch products on load
  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/admin');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewUrl('');
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(previewUrl);
    setImagePreviewError(false);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  const uploadSelectedImage = async () => {
    const file = selectedFile || fileInputRef.current?.files?.[0] || null;
    if (!file) {
      toast.error('Please choose an image file first.');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res?.data?.absoluteUrl || '';
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but image URL was missing');
      }

      setImageUrl(uploadedUrl);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Image uploaded. Click Add/Update Product to save.');
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadFileAndGetUrl = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await API.post('/admin/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const uploadedUrl = res?.data?.absoluteUrl || res?.data?.url || '';
    if (!uploadedUrl) {
      throw new Error('Image upload succeeded but URL was missing');
    }
    return uploadedUrl;
  };

  const validateImageUrl = async (url: string) => {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      const timer = window.setTimeout(() => reject(new Error('Image load timeout')), 8000);

      img.onload = () => {
        window.clearTimeout(timer);
        resolve();
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error('Image failed to load'));
      };

      img.src = url;
    });
  };

  // Add or update product
  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !price || !description.trim() || !stock) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      let finalImageUrl = imageUrl.trim();
      let uploadedFromFile = false;
      const fileFromInput = selectedFile || fileInputRef.current?.files?.[0] || null;

      // If a file is selected, always prefer uploading it over stale/old URL text.
      if (fileFromInput) {
        setUploadingImage(true);
        finalImageUrl = await uploadFileAndGetUrl(fileFromInput);
        uploadedFromFile = true;
        setUploadingImage(false);
        setImageUrl(finalImageUrl);
      }

      if (!finalImageUrl) {
        toast.error('Please provide an image URL or upload an image from folder.');
        return;
      }

      // For manually entered URLs, validate in browser before saving.
      // For file uploads, the backend already validated and stored the image.
      if (!uploadedFromFile) {
        await validateImageUrl(finalImageUrl);
      }

      const productData = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      description: description.trim(),
      stock: Number(stock),
      imageUrl: finalImageUrl,
      active: true
    };

      if (editingId !== null) {
        // Update existing product
        await API.put(`/products/${editingId}`, productData);
        toast.success('Product updated successfully');
      } else {
        // Add new product
        await API.post('/products', productData);
        toast.success('Product added successfully');
      }

      // Refresh product list
      fetchProducts();
      setName('');
      setCategory('');
      setPrice('');
      setDescription('');
      setStock('');
      setImageUrl('');
      setSelectedFile(null);
      setSelectedFilePreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImagePreviewError(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      const e = err as any;
      const message =
        e?.response?.data?.error ||
        e?.message ||
        'Failed to save product image. Please try again.';
      toast.error(message);
    } finally {
      setUploadingImage(false);
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category || '');
    setPrice(product.price.toString());
    setDescription(product.description);
    setStock(product.stock.toString());
    setImageUrl(product.imageUrl);
  };

  // Toggle product active state
  const handleToggle = async (id: number) => {
    try {
      await API.put(`/products/${id}/toggle`);
      fetchProducts();
      toast.success('Product status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product status');
    }
  };

  const filteredProducts = products
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter((product) => {
      const q = search.trim().toLowerCase();
      const statusOk = statusFilter === 'all' ? true : statusFilter === 'active' ? product.active : !product.active;
      const searchOk = q.length === 0
        ? true
        : product.name.toLowerCase().includes(q)
          || product.description.toLowerCase().includes(q)
          || String(product.id).includes(q);
      return statusOk && searchOk;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Product Management</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search by name, description, id"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 280 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Box component="form" onSubmit={handleAddOrUpdate} mb={3} display="flex" gap={2}>
        <TextField
          label="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <FormControl required sx={{ minWidth: 170 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={e => setCategory(e.target.value)}
          >
            <MenuItem value="" disabled>Select Category</MenuItem>
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
            {!!category && !CATEGORY_OPTIONS.includes(category) && (
              <MenuItem value={category}>{category}</MenuItem>
            )}
          </Select>
        </FormControl>
        <TextField
          label="Price"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
        <TextField
          label="Stock"
          type="number"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />
        <TextField
          label="Image URL"
          value={imageUrl}
          onChange={e => {
            setImageUrl(e.target.value);
            setImagePreviewError(false);
          }}
          placeholder="Paste image URL or use Upload From Folder"
        />
        <Box display="flex" flexDirection="column" gap={1}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] || null);
              setImagePreviewError(false);
            }}
          />
          <Button
            variant="outlined"
            onClick={uploadSelectedImage}
            disabled={uploadingImage || !selectedFile}
          >
            {uploadingImage ? 'Uploading...' : 'Upload From Folder'}
          </Button>
        </Box>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading || uploadingImage ? 'Please wait...' : editingId !== null ? 'Update Product' : 'Add Product'}
        </Button>
        {editingId !== null && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setEditingId(null);
              setName('');
              setCategory('');
              setPrice('');
              setDescription('');
              setStock('');
              setImageUrl('');
              setSelectedFile(null);
              setSelectedFilePreviewUrl('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Cancel
          </Button>
        )}
      </Box>

      {(selectedFilePreviewUrl || imageUrl.trim()) && (
        <Box mb={2}>
          <Typography variant="body2" sx={{ mb: 1 }}>Image Preview</Typography>
          <img
            src={selectedFilePreviewUrl || imageUrl.trim()}
            alt="Preview"
            width={120}
            height={120}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d1d5db', background: '#f8fafc' }}
            onError={() => setImagePreviewError(true)}
            onLoad={() => setImagePreviewError(false)}
          />
          {imagePreviewError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              This URL is not loading an image. Please use another URL or upload from folder.
            </Typography>
          )}
        </Box>
      )}

      {paginatedProducts.map(product => (
        <Box
          key={product.id}
          display="flex"
          gap={2}
          alignItems="center"
          border={1}
          borderRadius={2}
          p={2}
          mb={2}
        >
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.name}
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.onerror = null;
              img.src = FALLBACK_IMAGE;
            }}
          />
          <Box flex={1}>
            <Typography variant="h6">{product.name}</Typography>
            <Typography>Category: {product.category || 'Uncategorized'}</Typography>
            <Typography>Description: {product.description}</Typography>
            <Typography>₹{product.price} | Stock: {product.stock}</Typography>
            <Typography color={product.active ? 'green' : 'red'}>
              {product.active ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="info"
              onClick={() => handleEdit(product)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color={product.active ? 'warning' : 'success'}
              onClick={() => setConfirmToggleId(product.id)}
            >
              {product.active ? 'Disable' : 'Enable'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirmDeleteId(product.id)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>

      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!confirmDeleteId) return;
              await handleDelete(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmToggleId !== null} onClose={() => setConfirmToggleId(null)}>
        <DialogTitle>Change Product Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change this product status?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmToggleId(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!confirmToggleId) return;
              await handleToggle(confirmToggleId);
              setConfirmToggleId(null);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;
