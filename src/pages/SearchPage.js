import React from 'react';
import { LoadingSpinner } from '../components';

const SearchPage = () => {
  return (
    <div className='container-custom section-padding'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Search Results
        </h1>
        <p className='text-gray-600 mb-8'>
          Search functionality coming soon...
        </p>
        <LoadingSpinner size='lg' />
      </div>
    </div>
  );
};

export default SearchPage;
