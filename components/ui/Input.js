'use client';

import { forwardRef, useState } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  containerClassName = '',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variants = {
    default: `border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    }`,
    filled: `border-transparent bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 ${
      error ? 'bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    }`,
    outline: `border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    }`
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    leftIcon ? (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10') : '',
    rightIcon || type === 'password' ? (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-10') : '',
    disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const iconPosition = size === 'sm' ? 'top-2 left-3' : size === 'lg' ? 'top-3.5 left-3' : 'top-2.5 left-3';
  const rightIconPosition = size === 'sm' ? 'top-2 right-3' : size === 'lg' ? 'top-3.5 right-3' : 'top-2.5 right-3';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 transition-colors ${
            error ? 'text-red-700' : isFocused ? 'text-indigo-700' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`absolute ${iconPosition} pointer-events-none`}>
            <div className={`${iconSize} text-gray-400`}>
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type === 'password' && showPassword ? 'text' : type}
          className={classes}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className={`absolute ${rightIconPosition} text-gray-400 hover:text-gray-600 focus:outline-none`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122l4.242 4.242M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <div className={`absolute ${rightIconPosition} pointer-events-none`}>
            <div className={`${iconSize} text-gray-400`}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;