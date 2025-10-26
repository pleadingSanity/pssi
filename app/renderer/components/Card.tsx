import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, subtitle, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default Card;
