import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const BudgetVisualization = ({ categories, monthlyComparison }) => {
  const [activeView, setActiveView] = useState('pie'); // 'pie' or 'comparison'

  // Prepare data for pie chart
  const pieData = categories?.map(category => ({
    name: category?.name,
    value: category?.allocated,
    spent: category?.spent,
    color: category?.color,
    icon: category?.icon
  }));

  // Custom label function for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      const spentPercentage = data?.value > 0 ? (data?.spent / data?.value) * 100 : 0;
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 financial-shadow-modal">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data?.color }}
            ></div>
            <span className="font-medium text-popover-foreground">{data?.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocated:</span>
              <span className="text-popover-foreground">{formatCurrency(data?.value, currency, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spent:</span>
              <span className="text-popover-foreground">{formatCurrency(data?.spent, currency, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usage:</span>
              <span className={`${spentPercentage > 100 ? 'text-error' : spentPercentage > 75 ? 'text-warning' : 'text-success'}`}>
                {spentPercentage?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 financial-shadow-modal">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload?.map((entry, index) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry?.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{entry?.dataKey}:</span>
                </div>
                <span className="text-sm font-medium text-popover-foreground">
                  {formatCurrency(entry?.value, currency, locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const { currency, locale } = usePreferences();
  return (
    <div className="bg-card rounded-lg border border-border financial-shadow-card">
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Budget Visualization</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('pie')}
              iconName="PieChart"
              iconPosition="left"
              iconSize={14}
            >
              Distribution
            </Button>
            <Button
              variant={activeView === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('comparison')}
              iconName="BarChart3"
              iconPosition="left"
              iconSize={14}
            >
              Trends
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 lg:p-6">
        {activeView === 'pie' ? (
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pieData?.map((category, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{category?.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(category?.value, currency, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Monthly Comparison Chart */}
            <div className="h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value, currency, locale)}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="budgeted" 
                    fill="var(--color-primary)" 
                    name="Budgeted"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="spent" 
                    fill="var(--color-accent)" 
                    name="Spent"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="TrendingUp" size={20} className="text-success mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Avg. Savings</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(1250, currency, locale)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="Target" size={20} className="text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">On Track</p>
                <p className="text-sm font-semibold text-foreground">85%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="AlertTriangle" size={20} className="text-warning mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Over Budget</p>
                <p className="text-sm font-semibold text-foreground">2 Categories</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Icon name="Calendar" size={20} className="text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Days Left</p>
                <p className="text-sm font-semibold text-foreground">12</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetVisualization;
