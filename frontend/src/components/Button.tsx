import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500 disabled:bg-blue-400',
    secondary: 'bg-notion-hover-light dark:bg-notion-hover-dark text-notion-text-primary-light dark:text-notion-text-primary-dark hover:bg-notion-active-light dark:hover:bg-notion-active-dark border border-notion-border-light dark:border-notion-border-dark',
    ghost: 'text-notion-text-secondary-light dark:text-notion-text-secondary-dark hover:bg-notion-hover-light dark:hover:bg-notion-hover-dark',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-green-500 disabled:bg-green-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 disabled:bg-red-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={disabled ? 'opacity-60' : ''}>{icon}</span>}
      {children}
    </button>
  );
};
