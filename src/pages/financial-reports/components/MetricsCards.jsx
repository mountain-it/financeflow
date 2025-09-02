import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCards = ({ metrics }) => {
  const getMetricIcon = (type) => {
    switch (type) {
      case 'income':
        return 'TrendingUp';
      case 'expenses':
        return 'TrendingDown';
      case 'savings':
        return 'PiggyBank';
      case 'budget':
        return 'Target';
      default:
        return 'DollarSign';
    }
  };

  const getMetricColor = (type, trend) => {
    if (type === 'expenses') {
      return trend === 'up' ? 'text-error' : 'text-success';
    }
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics?.map((metric) => (
        <div
          key={metric?.id}
          className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={getMetricIcon(metric?.type)} size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{metric?.title}</h3>
            </div>
            <div className={`flex items-center space-x-1 ${getMetricColor(metric?.type, metric?.trend)}`}>
              <Icon name={getTrendIcon(metric?.trend)} size={12} />
              <span className="text-xs font-medium">{metric?.change}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{metric?.value}</p>
            <p className="text-xs text-muted-foreground">{metric?.subtitle}</p>
          </div>
          
          {metric?.progress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{metric?.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full financial-transition"
                  style={{ width: `${metric?.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;