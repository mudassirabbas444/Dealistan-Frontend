import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Grid, List, Plus } from 'lucide-react';
import { Button, Input, LoadingSpinner, ProductCard } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import categoryService from '../../services/category';
import productService from '../../services/product';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories();
      // The API returns { data: { categories: [...], total, page, pages } }
      return response.data?.categories || [];
    }
  });

  // Fetch products for selected category
  const {
    data: categoryProducts,
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['category-products', selectedCategory?._id, searchQuery],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await productService.getProducts({
        category: selectedCategory._id,
        search: searchQuery
      });
      return response.data || [];
    },
    enabled: !!selectedCategory
  });

  const handleCategorySelect = (category) => {
    // Redirect to ProductsPage with category filter in URL
    navigate(`/products?category=${category._id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled automatically by React Query
  };

  if (!isAuthenticated) {
    return (
      <div className='container-custom section-padding'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Categories</h1>
          <p className='text-gray-600 mb-8'>Please login to view categories</p>
          <Link to='/login'>
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='container-custom section-padding'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Categories Sidebar */}
        <div className='lg:w-1/3'>
          <div className='bg-white rounded-lg shadow-soft p-6 sticky top-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>Categories</h2>
              {isAuthenticated && (
                <Link to='/products/create'>
                  <Button size='sm'>
                    <Plus className='h-4 w-4 mr-1' />
                    Sell
                  </Button>
                </Link>
              )}
            </div>

            {categoriesLoading ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner />
              </div>
            ) : categoriesError ? (
              <div className='text-center py-8'>
                <p className='text-red-600 mb-4'>Error loading categories</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <div className='space-y-2'>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {Array.isArray(categories) && categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory?._id === category._id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      {category.icon && (
                        <span className='text-2xl'>{category.icon}</span>
                      )}
                      <div>
                        <div className='font-medium'>{category.name}</div>
                        {category.description && (
                          <div className='text-sm text-gray-500'>
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className='lg:w-2/3'>
          {!selectedCategory ? (
            <div className='bg-white rounded-lg shadow-soft p-12 text-center'>
              <div className='text-6xl mb-4'>📂</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Select a Category
              </h3>
              <p className='text-gray-600'>
                Choose a category from the sidebar to view products
              </p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className='bg-white rounded-lg shadow-soft p-6 mb-6'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                      {selectedCategory.name}
                    </h1>
                    {selectedCategory.description && (
                      <p className='text-gray-600'>
                        {selectedCategory.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Search */}
                  <form onSubmit={handleSearch} className='flex gap-2 w-full md:w-auto'>
                    <Input
                      placeholder='Search in category...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search className='h-4 w-4 text-gray-400' />}
                      className='min-w-64'
                    />
                    <Button type='submit' variant='secondary'>
                      Search
                    </Button>
                  </form>
                </div>
              </div>

              {/* View Controls */}
              <div className='flex justify-between items-center mb-6'>
                <p className='text-gray-600'>
                  {Array.isArray(categoryProducts) ? categoryProducts.length : 0} products found
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

              {/* Products */}
              {productsLoading ? (
                <div className='flex justify-center py-12'>
                  <LoadingSpinner size='lg' />
                </div>
              ) : productsError ? (
                <div className='text-center py-12'>
                  <p className='text-red-600 mb-4'>Error loading products</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : !Array.isArray(categoryProducts) || categoryProducts.length === 0 ? (
                <div className='bg-white rounded-lg shadow-soft p-12 text-center'>
                  <div className='text-6xl mb-4'>🔍</div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No Products Found
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    {searchQuery
                      ? `No products found matching "${searchQuery}"`
                      : 'No products available in this category yet'
                    }
                  </p>
                  <Link to='/products/create'>
                    <Button>
                      <Plus className='h-5 w-5 mr-2' />
                      Create First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {Array.isArray(categoryProducts) && categoryProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default CategoriesPage;
