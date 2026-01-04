import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  pctChange: number;
  isCurrency?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, pctChange }) => {
  const isPositive = pctChange >= 0;
  const isNeutral = Math.abs(pctChange) < 1;

  let colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  let bgClass = isPositive ? 'bg-green-100' : 'bg-red-100';
  let arrow = isPositive ? '↑' : '↓';

  // Invert colors for Ad Spend? Usually spending more is "bad" for efficiency but "good" for scale. 
  // For simplicity, let's stick to standard financial coloring (Growth = Green).
  
  if (isNeutral) {
    colorClass = 'text-gray-500';
    bgClass = 'bg-gray-100';
    arrow = '—';
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start justify-between">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${colorClass}`}>
        {arrow} {Math.abs(pctChange).toFixed(1)}% vs prev
      </div>
    </div>
  );
};

export default MetricCard;