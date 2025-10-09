import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import categoryService from '../services/category';
import { Search, Plus, Shield, Users, Zap } from 'lucide-react';
import { Button } from '../components';

const HomePage = () => {
  // Fetch root categories (no parent)
  const { data: categories } = useQuery({
    queryKey: ['home-categories'],
    queryFn: async () => {
      const response = await categoryService.getCategories({ parentCategory: 'null', isActive: true, limit: 12 });
      return response.data?.categories || [];
    }
  });

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='bg-gradient-primary text-white'>
        <div className='container-custom section-padding'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>
              Buy & Sell Anything,
              <span className='block text-yellow-300'>Anywhere</span>
            </h1>
            <p className='text-xl md:text-2xl mb-8 text-blue-100'>
              The leading classified ads marketplace connecting buyers and
              sellers across the globe.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link to='/products'>
                <Button
                  size='lg'
                  variant='secondary'
                  className='w-full sm:w-auto'
                >
                  <Search className='h-5 w-5 mr-2' />
                  Browse Products
                </Button>
              </Link>
              <Link to='/products/create'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600'
                >
                  <Plus className='h-5 w-5 mr-2' />
                  Sell Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='section-padding bg-white'>
        <div className='container-custom'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Why Choose Dealistaan?
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              We provide the best platform for buying and selling with trust,
              security, and convenience.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Shield className='h-8 w-8 text-primary-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Safe & Secure
              </h3>
              <p className='text-gray-600'>
                Your transactions are protected with our advanced security
                measures and verified seller system.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Users className='h-8 w-8 text-primary-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Trusted Community
              </h3>
              <p className='text-gray-600'>
                Join millions of users who trust Dealistaan for their buying and
                selling needs.
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Zap className='h-8 w-8 text-primary-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                Fast & Easy
              </h3>
              <p className='text-gray-600'>
                List your items in minutes and start selling to interested
                buyers in your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className='section-padding bg-gray-50'>
        <div className='container-custom'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Popular Categories
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Explore our most popular categories and find exactly what you're
              looking for.
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6'>
            {Array.isArray(categories) && categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className='card card-hover p-6 text-center group'
              >
                <div className='text-4xl mb-4'>📦</div>
                <h3 className='font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='section-padding bg-primary-600 text-white'>
        <div className='container-custom text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Ready to Get Started?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join thousands of satisfied users who have found great deals on
            Dealistaan.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/register'>
              <Button size='lg' variant='secondary'>
                Create Account
              </Button>
            </Link>
            <Link to='/products'>
              <Button
                size='lg'
                variant='outline'
                className='border-white text-white hover:bg-white hover:text-primary-600'
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
