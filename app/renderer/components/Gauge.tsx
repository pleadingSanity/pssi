import React from 'react';

interface GaugeProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
}

const Gauge: React.FC<GaugeProps> = ({ 
  label, 
  value, 
  max = 100, 
  unit = '%',
  color = 'blue'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = () => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return `bg-${color}-500`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className="text-xl font-bold text-white">
          {value}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Gauge;
