import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FolderTree, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings
} from 'lucide-react';
import NotificationContainer from '../common/NotificationContainer';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className='fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className='flex'>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Admin Panel</h1>
              <p className='text-sm text-gray-500'>Control Center</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className='md:hidden p-2 rounded-lg hover:bg-gray-100'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Profile Section */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                <User className='w-5 h-5 text-white' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>{user?.name || 'Admin'}</p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className='mt-3 w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            >
              <LogOut className='w-4 h-4' />
              <span>Logout</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className='p-4 space-y-1'>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className='w-5 h-5' />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 md:ml-0'>
          {/* Top Header */}
          <header className='bg-white border-b border-gray-200 px-4 py-3 md:px-6'>
            <div className='flex items-center justify-between'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='md:hidden p-2 rounded-lg hover:bg-gray-100'
              >
                <Menu className='w-5 h-5' />
              </button>
              
              <div className='flex items-center space-x-4'>
                <div className='hidden md:flex items-center space-x-2 text-sm text-gray-500'>
                  <span>Welcome back,</span>
                  <span className='font-medium text-gray-900'>{user?.name || 'Admin'}</span>
                </div>
                
                <div className='flex items-center space-x-2'>
                  <button className='p-2 rounded-lg hover:bg-gray-100'>
                    <Settings className='w-5 h-5 text-gray-500' />
                  </button>
                  <button
                    onClick={handleLogout}
                    className='hidden md:flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default AdminLayout;


