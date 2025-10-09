import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, LoadingSpinner } from '../../components';
import authService from '../../services/auth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const role = res?.user?.role;
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        setError('This account is not an admin.');
      }
    } catch (err) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-custom section-padding'>
      <div className='max-w-md mx-auto card p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Admin Login</h1>
        <p className='text-gray-600 mb-6'>Sign in to access the admin panel</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className='text-red-600 text-sm'>{error}</div>}

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <LoadingSpinner size='sm' /> : 'Login as Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;


