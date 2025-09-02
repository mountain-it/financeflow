import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const InteractiveChart = ({ data, title, type = 'bar' }) => {
  const [chartType, setChartType] = useState(type);
  const [dateRange, setDateRange] = useState('3months');

  const chartTypeOptions = [
    { value: 'bar', label: 'Bar Chart', description: 'Compare values across categories' },
    { value: 'line', label: 'Line Chart', description: 'Show trends over time' },
    { value: 'pie', label: 'Pie Chart', description: 'Show proportional distribution' }
  ];

  const dateRangeOptions = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const colors = ['#1E40AF', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Move these functions BEFORE the return statement
  const handleExportChart = () => {
    // Convert chart to image and download
    const chartElement = document.querySelector('.recharts-wrapper');
    if (chartElement) {
      html2canvas(chartElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };
  
  const handleShareChart = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this financial chart: ${title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };
  
  const handleFullScreen = () => {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer.requestFullscreen) {
      chartContainer.requestFullscreen();
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#1E40AF" 
              strokeWidth={2}
              dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors?.[index % colors?.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
          </PieChart>
        );
      
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            placeholder="Chart Type"
            options={chartTypeOptions}
            value={chartType}
            onChange={setChartType}
            className="w-full sm:w-40"
          />
          <Select
            placeholder="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={setDateRange}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      <div className="w-full h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Remove the comment and move the JSX here */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" iconName="Download" onClick={handleExportChart}>
          Export Chart
        </Button>
        <Button variant="ghost" size="sm" iconName="Share" onClick={handleShareChart}>
          Share
        </Button>
        <Button variant="ghost" size="sm" iconName="Maximize2" onClick={handleFullScreen}>
          Full Screen
        </Button>
      </div>
    </div>
  );
};

export default InteractiveChart;