import React, { forwardRef } from 'react';
import { cn } from '../../utils';

const Input = forwardRef(
  (
    { label, error, helperText, leftIcon, rightIcon, className = '', ...props },
    ref
  ) => {
    const inputClasses = cn(
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error && 'border-red-300 focus:ring-red-500 focus:border-red-300',
      className
    );

    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-1',
      error && 'text-red-700'
    );

    const helperTextClasses = cn(
      'mt-1 text-sm',
      error ? 'text-red-600' : 'text-gray-500'
    );

    return (
      <div className='w-full'>
        {label && <label className={labelClasses}>{label}</label>}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {leftIcon}
            </div>
          )}

          <input ref={ref} className={inputClasses} {...props} />

          {rightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={helperTextClasses}>{error || helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
