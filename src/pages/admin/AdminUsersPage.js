import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/admin';
import { Button, Input, LoadingSpinner } from '../../components';

const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => (await adminService.getUsers({ limit: 20, page: 1, search })).data,
  });

  const users = data?.users || [];

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = [u.name, u.email, u.phone, u.city].some(v => String(v || '').toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesVerified = verifiedFilter ? String(u.verified) === verifiedFilter : true;
      const matchesCity = cityFilter ? String(u.city || '').toLowerCase().includes(cityFilter.toLowerCase()) : true;
      return matchesSearch && matchesRole && matchesVerified && matchesCity;
    });
  }, [users, search, roleFilter, verifiedFilter, cityFilter]);

  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      return await adminService.deleteUser?.(userId);
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete user');
    }
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }) => adminService.updateUser(id, data),
    onSuccess: () => {
      setEditing(null);
      toast.success('User updated successfully');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update user');
    }
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Users</h1>
          <p className='text-gray-600'>Manage platform users</p>
        </div>
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <Input placeholder='Search users...' value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className='input-base w-36' value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value=''>All roles</option>
            <option value='user'>User</option>
            <option value='admin'>Admin</option>
          </select>
          <select className='input-base w-40' value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
            <option value=''>All verification</option>
            <option value='true'>Verified</option>
            <option value='false'>Unverified</option>
          </select>
          <Input className='w-40' placeholder='City filter' value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
        </div>
      </div>

      <div className='card p-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className='text-red-600'>Failed to load users</div>
        ) : users.length === 0 ? (
          <div className='text-gray-600'>No users found</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='text-left text-gray-600 border-b'>
                  <th className='py-2 pr-4'>Name</th>
                  <th className='py-2 pr-4'>Email</th>
                  <th className='py-2 pr-4'>Role</th>
                  <th className='py-2 pr-4'>Verified</th>
                  <th className='py-2 pr-4'>Created</th>
                  <th className='py-2 pr-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id || u.id} className='border-b last:border-0'>
                    <td className='py-2 pr-4'>{u.name}</td>
                    <td className='py-2 pr-4'>{u.email}</td>
                    <td className='py-2 pr-4 capitalize'>{u.role}</td>
                    <td className='py-2 pr-4'>
                      <span className={`px-2 py-1 rounded-full text-xs ${u.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className='py-2 pr-4'>{new Date(u.createdAt).toLocaleDateString?.() || ''}</td>
                    <td className='py-2 pr-0'>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' size='sm' onClick={() => { setEditing(u); setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', city: u.city || '' }); }}>
                          Edit
                        </Button>
                        <Button variant='outline' size='sm' onClick={() => { if (window.confirm('Are you sure you want to delete this user?')) deleteUser.mutate(u._id || u.id); }} disabled={!adminService.deleteUser}>
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
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Edit User</h3>
            <div className='space-y-3'>
              <Input placeholder='Name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type='email' placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder='Phone' value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder='City' value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={() => updateUser.mutate({ id: editing._id || editing.id, data: form })}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;


