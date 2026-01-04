import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyData } from '../types';

interface ChartsProps {
  data: DailyData[];
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  // Format date for X Axis
  const formattedData = data.map(d => ({
    ...d,
    shortDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96 w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue & Ad Spend Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="shortDate" 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            yAxisId="left" 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="revenue" 
            stroke="#4F46E5" 
            strokeWidth={3} 
            dot={false} 
            name="Revenue"
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="ad_spend" 
            stroke="#F59E0B" 
            strokeWidth={2} 
            dot={false} 
            name="Ad Spend" 
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;