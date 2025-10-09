import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/admin';
import productService from '../../services/product';
import categoryService from '../../services/category';
import { Button, Input, LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs capitalize ${
    status === 'approved' ? 'bg-green-100 text-green-700' :
    status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
    status === 'rejected' ? 'bg-red-100 text-red-700' :
    status === 'sold' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-700'
  }`}>
    {status}
  </span>
);

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', condition: '' });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await categoryService.getCategories()).data || []
  });

  const categories = categoriesData?.categories || categoriesData || [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', search, statusFilter],
    queryFn: async () => (await adminService.getProducts({ limit: 50, page: 1, keywords: search, status: statusFilter })).data,
  });

  const products = data?.products || data || [];

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = categoryFilter ? p.category?._id === categoryFilter || p.category === categoryFilter : true;
      const matchesCondition = conditionFilter ? p.condition === conditionFilter : true;
      const matchesMinPrice = minPrice ? (p.price || 0) >= parseFloat(minPrice) : true;
      const matchesMaxPrice = maxPrice ? (p.price || 0) <= parseFloat(maxPrice) : true;
      return matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, categoryFilter, conditionFilter, minPrice, maxPrice]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, nextStatus }) => productService.updateProduct(id, { status: nextStatus }),
    onSuccess: (_, { nextStatus }) => {
      toast.success(`Product ${nextStatus} successfully`);
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update product status');
    }
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      setEditing(null);
      toast.success('Product updated successfully');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update product');
    }
  });

  const removeProduct = useMutation({
    mutationFn: async (id) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete product');
    }
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Products</h1>
          <p className='text-gray-600'>Moderate products</p>
        </div>
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <Input placeholder='Search products...' value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className='input-base w-40' value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value=''>All statuses</option>
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
            <option value='sold'>Sold</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <select className='input-base' value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value=''>All categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <select className='input-base' value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
          <option value=''>All conditions</option>
          <option value='new'>New</option>
          <option value='used'>Used</option>
          <option value='refurbished'>Refurbished</option>
        </select>
        <Input type='number' placeholder='Min price' value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <Input type='number' placeholder='Max price' value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>

      <div className='card p-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className='text-red-600'>Failed to load products</div>
        ) : filtered.length === 0 ? (
          <div className='text-gray-600'>No products found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-600 border-b'>
                  <th className='py-2 pr-4'>Product</th>
                  <th className='py-2 pr-4'>Price</th>
                  <th className='py-2 pr-4'>Seller</th>
                  <th className='py-2 pr-4'>Status</th>
                  <th className='py-2 pr-4'>Views</th>
                  <th className='py-2 pr-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className='border-b last:border-0'>
                    <td className='py-2 pr-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0'>
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.title} className='w-full h-full object-cover' />
                          ) : null}
                        </div>
                        <div>
                          <div className='font-medium text-gray-900 truncate max-w-xs'>{p.title}</div>
                          <div className='text-xs text-gray-500 truncate max-w-xs'>{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className='py-2 pr-4'>${Number(p.price).toLocaleString?.() || p.price}</td>
                    <td className='py-2 pr-4'>{p.seller?.name || p.seller}</td>
                    <td className='py-2 pr-4'><StatusBadge status={p.status} /></td>
                    <td className='py-2 pr-4'>{p.views || 0}</td>
                    <td className='py-2 pr-0'>
                      <div className='flex justify-end gap-2'>
                        <Button size='sm' variant='outline' onClick={() => { setEditing(p); setForm({ title: p.title || '', description: p.description || '', price: p.price || '', condition: p.condition || '' }); }}>
                          Edit
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => { if (window.confirm('Approve this product?')) updateStatus.mutate({ id: p._id, nextStatus: 'approved' }); }}>
                          Approve
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => { if (window.confirm('Reject this product?')) updateStatus.mutate({ id: p._id, nextStatus: 'rejected' }); }}>
                          Reject
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => { if (window.confirm('Delete this product?')) removeProduct.mutate(p._id); }}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
          <div className='card p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Edit Product</h3>
            <div className='space-y-3'>
              <Input placeholder='Title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className='input-base' placeholder='Description' rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type='number' placeholder='Price' value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <select className='input-base' value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value=''>Select condition</option>
                <option value='new'>New</option>
                <option value='used'>Used</option>
                <option value='refurbished'>Refurbished</option>
              </select>
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => updateProduct.mutate({ id: editing._id, data: form })}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;


