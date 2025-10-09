import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components';

const NotFoundPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md mx-auto text-center'>
        <div className='mb-8'>
          <h1 className='text-9xl font-bold text-primary-600'>404</h1>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
            Page Not Found
          </h2>
          <p className='text-gray-600 mb-8'>
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className='space-y-4'>
          <Link to='/'>
            <Button size='lg' className='w-full'>
              <Home className='h-5 w-5 mr-2' />
              Go Home
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className='w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            <ArrowLeft className='h-5 w-5 mr-2' />
            Go Back
          </button>
        </div>

        <div className='mt-8 text-sm text-gray-500'>
          <p>
            Need help?{' '}
            <Link to='/contact' className='text-primary-600 hover:underline'>
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
