import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  User,
  Heart,
  MessageCircle,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../context/AppContext';
import { useFavoritesCount } from '../../hooks/useFavorites';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../utils';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { searchQuery, setSearchQuery, toggleSidebar } = useApp();
  const { data: favoritesCount } = useFavoritesCount();
  const { unreadCount, isConnected } = useSocket();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleCreateProduct = () => {
    if (isAuthenticated) {
      navigate('/products/create');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>D</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>
                Dealistaan
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className='hidden md:flex flex-1 max-w-lg mx-8'>
            <form onSubmit={handleSearch} className='w-full'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search for products...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
                <Search className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className='hidden md:flex items-center space-x-4'>
            <Link to='/' className='text-gray-700 hover:text-primary-600 transition-colors'>
              Home
            </Link>
            <Link to='/products' className='text-gray-700 hover:text-primary-600 transition-colors'>
              Products
            </Link>
            {/* Create Product Button */}
            <button
              onClick={handleCreateProduct}
              className='inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
            >
              <Plus className='h-4 w-4 mr-2' />
              Sell Item
            </button>

            {isAuthenticated ? (
              <>
                {/* Messages */}
                <Link
                  to='/messages'
                  className='relative p-2 text-gray-600 hover:text-primary-600 transition-colors'
                >
                  <MessageCircle className={cn(
                    'h-6 w-6',
                    !isConnected && 'opacity-50'
                  )} />
                  {unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse'>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {!isConnected && (
                    <div className='absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full' title='Disconnected' />
                  )}
                </Link>

                {/* Favorites */}
                <Link
                  to='/favorites'
                  className='relative p-2 text-gray-600 hover:text-primary-600 transition-colors'
                >
                  <Heart className='h-6 w-6' />
                  {favoritesCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className='relative'>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className='flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                      <User className='h-4 w-4 text-primary-600' />
                    </div>
                    <span className='text-sm font-medium text-gray-700'>
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                      <Link
                        to='/profile'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className='h-4 w-4 mr-3' />
                        Profile
                      </Link>
                      <Link
                        to='/dashboard'
                        className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className='h-4 w-4 mr-3' />
                        Dashboard
                      </Link>
                      <hr className='my-1' />
                      <button
                        onClick={handleLogout}
                        className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                      >
                        <LogOut className='h-4 w-4 mr-3' />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  to='/login'
                  className='text-gray-600 hover:text-primary-600 transition-colors'
                >
                  Login
                </Link>
                <Link
                  to='/register'
                  className='inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
            >
              {isMobileMenuOpen ? (
                <X className='h-6 w-6 text-gray-600' />
              ) : (
                <Menu className='h-6 w-6 text-gray-600' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className='md:hidden pb-4'>
          <form onSubmit={handleSearch}>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search for products...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
              <Search className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200 py-4'>
            <div className='space-y-4'>
              <Link
                to='/'
                className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to='/products'
                className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to='/dashboard'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to='/profile'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to='/messages'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    to='/favorites'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <button
                    onClick={handleCreateProduct}
                    className='block w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg'
                  >
                    Sell Item
                  </button>
                  <hr className='my-2' />
                  <button
                    onClick={handleLogout}
                    className='block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg'
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to='/login'
                    className='block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='block px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
