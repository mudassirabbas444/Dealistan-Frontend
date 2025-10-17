import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Grid, List, Plus, MapPin, Clock, AlertCircle, X } from 'lucide-react';
import { useQuery as useRQ } from '@tanstack/react-query';
import categoryService from '../../services/category';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, LoadingSpinner, ProductCard } from '../../components';
import { useLocation as useUserLocation } from '../../hooks';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/product';
import { formatCurrency, formatRelativeTime } from '../../utils';
import { sanitizeInput } from '../../utils/security';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: ''
  });
  const [filterErrors, setFilterErrors] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const { location: userLocation, requestLocationPermission, getCurrentLocation } = useUserLocation();

  const applyUserLocationFilter = () => {
    const city = userLocation?.address?.city;
    if (!city) {
      requestLocationPermission();
      return;
    }
    setFilters((f) => ({ ...f, location: city }));
    toast.success(`Filtering by location: ${city}`);
  };

  const clearLocationFilterOnly = () => {
    setFilters((f) => ({ ...f, location: '' }));
  };

  // Fetch root categories for filter
  const { data: categories } = useRQ({
    queryKey: ['filter-categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories({ parentCategory: 'null', isActive: true, limit: 100 });
      return response.data?.categories || [];
    }
  });

  // Fetch products with React Query
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', searchQuery, filters],
    queryFn: async () => {
      const params = {
        keywords: searchQuery,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        condition: filters.condition,
        location: filters.location
      };

      // If user has coordinates, include lat/lon for distance-based sorting (no radius by default)
      if (userLocation?.coordinates) {
        params.lat = userLocation.coordinates.latitude;
        params.lon = userLocation.coordinates.longitude;
      }

      const response = await productService.searchProducts(params);
      return response.data?.products || [];
    },
    enabled: true,
  });

  // Track active filters
  useEffect(() => {
    const active = Object.values(filters).some(value => value !== '') || searchQuery.trim() !== '';
    setHasActiveFilters(active);
  }, [filters, searchQuery]);

  // Validate filters
  const validateFilters = useCallback(() => {
    const errors = {};
    
    // Validate price range
    if (filters.minPrice && filters.maxPrice) {
      const minPrice = parseFloat(filters.minPrice);
      const maxPrice = parseFloat(filters.maxPrice);
      
      if (minPrice >= maxPrice) {
        errors.priceRange = 'Minimum price must be less than maximum price';
      }
      
      if (minPrice < 0 || maxPrice < 0) {
        errors.priceRange = 'Prices cannot be negative';
      }
      
      if (maxPrice > 999999) {
        errors.priceRange = 'Maximum price cannot exceed 999,999';
      }
    }
    
    // Validate individual prices
    if (filters.minPrice && (parseFloat(filters.minPrice) < 0 || parseFloat(filters.minPrice) > 999999)) {
      errors.minPrice = 'Minimum price must be between 0 and 999,999';
    }
    
    if (filters.maxPrice && (parseFloat(filters.maxPrice) < 0 || parseFloat(filters.maxPrice) > 999999)) {
      errors.maxPrice = 'Maximum price must be between 0 and 999,999';
    }
    
    // Validate search query
    if (searchQuery.length > 100) {
      errors.searchQuery = 'Search query must be less than 100 characters';
    }
    
    setFilterErrors(errors);
    return Object.keys(errors).length === 0;
  }, [filters, searchQuery]);

  // Sync search box with ?q= from URL triggered by header search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
    const cat = params.get('category') || '';
    if (cat && cat !== filters.category) {
      setFilters((f) => ({ ...f, category: cat }));
    }
  }, [location.search]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    // Validate filters before search
    if (!validateFilters()) {
      toast.error('Please fix the filter errors before searching');
      return;
    }
    
    // Sanitize search query
    const sanitizedQuery = sanitizeInput(searchQuery);
    if (sanitizedQuery !== searchQuery) {
      setSearchQuery(sanitizedQuery);
    }
    
    refetch();
  }, [validateFilters, searchQuery, refetch]);

  // Refetch on filter change without submit
  useEffect(() => {
    refetch();
  }, [filters, searchQuery, refetch]);

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: ''
    });
    setSearchQuery('');
  };

  if (!isAuthenticated) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Products</h1>
          <p className='text-gray-600 mb-8'>Please login to view products</p>
          <Link to='/login'>
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>All Products</h1>
          <p className='text-gray-600'>
            Discover amazing deals from sellers near you
          </p>
        </div>
        <Link to='/products/create'>
          <Button className='mt-4 md:mt-0'>
            <Plus className='h-5 w-5 mr-2' />
            Sell Item
          </Button>
        </Link>
      </div>

      {/* Location Bar */}
      <div className='bg-white rounded-lg shadow-soft p-4 mb-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='flex items-center gap-2 text-sm text-gray-700'>
            <MapPin className='h-4 w-4 text-primary-600' />
            {userLocation?.address?.city ? (
              <span>
                Your location: <span className='font-medium'>{userLocation.address.city}</span>
                {userLocation.address.area ? `, ${userLocation.address.area}` : ''}
              </span>
            ) : userLocation?.loading ? (
              <span>Detecting your location…</span>
            ) : (
              <span>Location not set</span>
            )}
          </div>
          <div className='flex gap-2'>
            <Button type='button' variant='secondary' onClick={applyUserLocationFilter}>
              Use my location
            </Button>
            <Button type='button' variant='outline' onClick={clearLocationFilterOnly} disabled={!filters.location}>
              Clear location
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-soft p-6 mb-8'>
        {/* Filter Errors */}
        {Object.keys(filterErrors).length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
            <div className='flex items-center mb-2'>
              <AlertCircle className='h-5 w-5 text-red-600 mr-2' />
              <span className='text-sm font-medium text-red-800'>
                Please fix the following filter errors:
              </span>
            </div>
            <ul className='text-sm text-red-700 list-disc list-inside'>
              {Object.entries(filterErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSearch} className='space-y-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <Input
                placeholder='Search products...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className='h-5 w-5 text-gray-400' />}
                maxLength={100}
                error={filterErrors.searchQuery}
              />
            </div>
            <Button type='submit' variant='secondary'>
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <select
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value=''>All Categories</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <Input
              placeholder='Min Price'
              type='number'
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              min={0}
              max={999999}
              error={filterErrors.minPrice || filterErrors.priceRange}
            />
            <Input
              placeholder='Max Price'
              type='number'
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              min={0}
              max={999999}
              error={filterErrors.maxPrice || filterErrors.priceRange}
            />
            <select
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              value={filters.condition}
              onChange={(e) => setFilters({...filters, condition: e.target.value})}
            >
              <option value=''>All Conditions</option>
              <option value='new'>New</option>
              <option value='used'>Used</option>
              <option value='refurbished'>Refurbished</option>
            </select>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className='flex-1'
              >
                <X className='h-4 w-4 mr-2' />
                Clear Filters
              </Button>
              {/* Show active location filter chip */}
              {filters.location && (
                <span className='px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  {filters.location}
                  <button
                    type='button'
                    className='ml-1 text-primary-700 hover:text-primary-900'
                    onClick={clearLocationFilterOnly}
                    aria-label='Clear location filter'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* View Controls */}
      <div className='flex justify-between items-center mb-6'>
        <p className='text-gray-600'>
          {Array.isArray(products) ? products.length : 0} products found
        </p>
        <div className='flex gap-2'>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setViewMode('grid')}
          >
            <Grid className='h-4 w-4' />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setViewMode('list')}
          >
            <List className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-red-600 mb-4'>Error loading products</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 mb-4'>No products found</p>
          <Link to='/products/create'>
            <Button>Create First Product</Button>
          </Link>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {Array.isArray(products) && products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default ProductsPage;
