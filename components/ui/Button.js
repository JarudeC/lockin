'use client';

import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 active:bg-indigo-800',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 active:bg-gray-400',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 active:bg-green-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 active:bg-red-800',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 active:bg-yellow-700',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100',
    ghost: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 active:bg-indigo-100',
    link: 'text-indigo-600 hover:text-indigo-800 underline-offset-4 hover:underline focus:ring-indigo-500'
  };
  
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    loading ? 'cursor-wait' : '',
    className
  ].filter(Boolean).join(' ');

  const iconClass = iconSizes[size];

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className={`animate-spin -ml-1 mr-2 ${iconClass}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={`-ml-0.5 mr-2 ${iconClass}`}>
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className={`ml-2 -mr-0.5 ${iconClass}`}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;