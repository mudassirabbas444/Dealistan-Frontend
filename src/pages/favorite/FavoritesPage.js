import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites, useFavoritesCount, useClearAllFavorites } from '../../hooks/useFavorites';
import { useRequireAuth } from '../../hooks/useAuth';
import { Layout, Button, LoadingSpinner, ProductCard } from '../../components';
import { Grid, List, Heart, Trash2, Search } from 'lucide-react';
import { formatCurrency } from '../../utils';

const FavoritesPage = () => {
  useRequireAuth();
  
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch user's favorites
  const {
    data: favorites,
    isLoading,
    error,
    refetch
  } = useFavorites({
    page: 1,
    limit: 50,
    sortBy: 'addedAt',
    sortOrder: 'desc'
  });

  // Fetch favorites count
  const { data: favoritesCount } = useFavoritesCount();

  // Clear all favorites mutation
  const clearAllFavorites = useClearAllFavorites();

  // Filter favorites based on search query
  const filteredFavorites = Array.isArray(favorites) 
    ? favorites.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleClearAll = async () => {
    try {
      await clearAllFavorites.mutateAsync();
      setShowClearConfirm(false);
      refetch();
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your favorites
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access your favorite products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Favorites - Dealistaan</title>
        <meta name="description" content="View and manage your favorite products" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            </div>
            <p className="text-gray-600">
              {favoritesCount ? `${favoritesCount} products` : '0 products'} saved to your favorites
            </p>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* View Controls */}
                <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Clear All Button */}
                {Array.isArray(favorites) && favorites.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Clear All Favorites
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove all products from your favorites? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleClearAll}
                    loading={clearAllFavorites.isLoading}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading favorites</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          ) : !Array.isArray(favorites) || favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Favorites Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your collection by adding products you love to your favorites.
              </p>
              <Button href="/products">
                Browse Products
              </Button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 mb-6">
                No favorites match your search criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {searchQuery 
                    ? `${filteredFavorites.length} of ${favorites.length} favorites found`
                    : `${filteredFavorites.length} favorites`
                  }
                </p>
              </div>

              {/* Favorites Grid/List */}
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredFavorites.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
