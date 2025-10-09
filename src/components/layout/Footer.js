import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Tips', href: '/safety' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Report Issue', href: '/report' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refund' },
    ],
    categories: [
      { name: 'Electronics', href: '/categories/electronics' },
      { name: 'Vehicles', href: '/categories/vehicles' },
      { name: 'Furniture', href: '/categories/furniture' },
      { name: 'Real Estate', href: '/categories/real-estate' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://facebook.com/dealistaan',
    },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/dealistaan' },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com/dealistaan',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: 'https://linkedin.com/company/dealistaan',
    },
  ];

  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* Company Info */}
          <div className='lg:col-span-2'>
            <Link to='/' className='flex items-center space-x-2 mb-4'>
              <div className='w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>D</span>
              </div>
              <span className='text-xl font-bold'>Dealistaan</span>
            </Link>

            <p className='text-gray-300 mb-6 max-w-md'>
              The leading classified ads marketplace connecting buyers and
              sellers across the globe. Buy, sell, and discover amazing deals on
              everything you need.
            </p>

            {/* Contact Info */}
            <div className='space-y-3 mb-6'>
              <div className='flex items-center space-x-3 text-gray-300'>
                <Mail className='h-5 w-5' />
                <span>support@dealistaan.com</span>
              </div>
              <div className='flex items-center space-x-3 text-gray-300'>
                <Phone className='h-5 w-5' />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className='flex items-center space-x-3 text-gray-300'>
                <MapPin className='h-5 w-5' />
                <span>123 Business St, City, State 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className='flex space-x-4'>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors'
                    aria-label={social.name}
                  >
                    <Icon className='h-5 w-5' />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Company</h3>
            <ul className='space-y-3'>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Support</h3>
            <ul className='space-y-3'>
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Legal</h3>
            <ul className='space-y-3'>
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className='text-gray-300 hover:text-white transition-colors'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className='border-t border-gray-800 mt-12 pt-8'>
          <div className='max-w-md mx-auto text-center'>
            <h3 className='text-lg font-semibold mb-2'>Stay Updated</h3>
            <p className='text-gray-300 mb-4'>
              Subscribe to our newsletter for the latest deals and updates.
            </p>
            <div className='flex space-x-2'>
              <input
                type='email'
                placeholder='Enter your email'
                className='flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400'
              />
              <button className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-800 mt-8 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center space-x-2 text-gray-300 mb-4 md:mb-0'>
              <span>&copy; {currentYear} Dealistaan. All rights reserved.</span>
            </div>

            <div className='flex items-center space-x-2 text-gray-300'>
              <span>Made with</span>
              <Heart className='h-4 w-4 text-red-500' />
              <span>by the Dealistaan team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;