import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import adminService from '../../services/admin';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, accent, change, changeType, linkTo }) => {
  const CardContent = () => (
    <div className='card p-5 hover:shadow-lg transition-shadow cursor-pointer'>
      <p className='text-sm text-gray-500'>{title}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'positive' ? '↗' : '↘'} {change}
        </p>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className='block'>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <h3 className='text-lg font-semibold text-gray-900 mb-4'>{title}</h3>
    {children}
  </div>
);

const AdminDashboardPage = () => {
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await adminService.getUsers({ limit: 100 })).data || { users: [], total: 0 },
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await adminService.getProducts({ limit: 100 })).data || { products: [], total: 0 },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await adminService.getCategories({ limit: 100 })).data || [],
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || users.length;
  const products = productsData?.products || productsData || [];
  const totalProducts = productsData?.total || products.length;
  const categories = categoriesData?.categories || categoriesData || [];

  const approvedCount = products.filter(p => p.status === 'approved').length;
  const pendingCount = products.filter(p => p.status === 'pending').length;
  const rejectedCount = products.filter(p => p.status === 'rejected').length;

  const approvedPct = totalProducts ? Math.round((approvedCount / totalProducts) * 100) : 0;
  const pendingPct = totalProducts ? Math.round((pendingCount / totalProducts) * 100) : 0;
  const rejectedPct = totalProducts ? Math.round((rejectedCount / totalProducts) * 100) : 0;

  // Chart data
  const productStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [approvedCount, pendingCount, rejectedCount],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0,
    }]
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Users',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }, {
      label: 'New Products',
      data: [2, 3, 20, 5, 1, 4],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }]
  };

  const categoryData = {
    labels: categories.slice(0, 5).map(c => c.name),
    datasets: [{
      label: 'Products per Category',
      data: categories.slice(0, 5).map(() => Math.floor(Math.random() * 50) + 10),
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
      ],
      borderWidth: 0,
    }]
  };

  const viewsData = {
    labels: products.slice(0, 10).map(p => `${p.title?.substring(0, 15)}...`),
    datasets: [{
      label: 'Views',
      data: products.slice(0, 10).map(p => p.views || 0),
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
      borderWidth: 1,
    }]
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600'>Key metrics and activity</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard title='Total Users' value={totalUsers} accent='text-primary-600' change='+12%' changeType='positive' linkTo='/admin/users' />
        <StatCard title='Total Products' value={totalProducts} accent='text-green-600' change='+8%' changeType='positive' linkTo='/admin/products' />
        <StatCard title='Categories' value={categories.length} accent='text-yellow-600' change='+2' changeType='positive' linkTo='/admin/categories' />
        <StatCard title='Active Products' value={approvedCount} accent='text-blue-600' change='+5%' changeType='positive' linkTo='/admin/products?status=approved' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartCard title='Product Status Distribution'>
          <Doughnut 
            data={productStatusData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </ChartCard>
        
        <ChartCard title='Monthly Growth'>
          <Line 
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </ChartCard>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ChartCard title='Top Categories'>
          <Bar 
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </ChartCard>
        
        <ChartCard title='Most Viewed Products'>
          <Bar 
            data={viewsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </ChartCard>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='card p-5 hover:shadow-lg transition-shadow'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Newest Users</h2>
            <Link to='/admin/users' className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              View All →
            </Link>
          </div>
          <div className='space-y-2'>
            {users.slice(0, 6).map(u => (
              <Link key={u._id || u.id} to={`/admin/users?search=${u.email}`} className='block hover:bg-gray-50 p-2 rounded transition-colors'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='truncate'>{u.name} <span className='text-gray-500'>({u.email})</span></span>
                  <span className='text-gray-500'>{new Date(u.createdAt).toLocaleDateString?.() || ''}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className='card p-5 hover:shadow-lg transition-shadow'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Recent Products</h2>
            <Link to='/admin/products' className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              View All →
            </Link>
          </div>
          <div className='space-y-2'>
            {products.slice(0, 6).map(p => (
              <Link key={p._id} to={`/admin/products?search=${p.title}`} className='block hover:bg-gray-50 p-2 rounded transition-colors'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='truncate'>{p.title}</span>
                  <span className='text-gray-500 capitalize'>{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


