import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-notion-bg-light dark:bg-notion-bg-dark
        border border-notion-border-light dark:border-notion-border-dark
        rounded-lg
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-notion-border-light dark:border-notion-border-dark">
      <div>
        <h2 className="text-xl font-semibold text-notion-text-primary-light dark:text-notion-text-primary-dark">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-notion-text-secondary-light dark:text-notion-text-secondary-dark">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};
