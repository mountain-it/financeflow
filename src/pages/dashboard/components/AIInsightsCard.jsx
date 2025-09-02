import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIInsightsCard = ({ insights }) => {
  const [currentInsight, setCurrentInsight] = useState(0);

  const getInsightIcon = (type) => {
    const iconMap = {
      'warning': 'AlertTriangle',
      'tip': 'Lightbulb',
      'achievement': 'Trophy',
      'recommendation': 'Target'
    };
    return iconMap?.[type] || 'Bot';
  };

  const getInsightColor = (type) => {
    const colorMap = {
      'warning': 'text-warning',
      'tip': 'text-primary',
      'achievement': 'text-success',
      'recommendation': 'text-accent'
    };
    return colorMap?.[type] || 'text-primary';
  };

  const getInsightBg = (type) => {
    const bgMap = {
      'warning': 'bg-warning/10',
      'tip': 'bg-primary/10',
      'achievement': 'bg-success/10',
      'recommendation': 'bg-accent/10'
    };
    return bgMap?.[type] || 'bg-primary/10';
  };

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights?.length);
  };

  const prevInsight = () => {
    setCurrentInsight((prev) => (prev - 1 + insights?.length) % insights?.length);
  };

  const insight = insights?.[currentInsight];

  return (
    <div className="bg-card border border-border rounded-lg p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Bot" size={20} className="text-primary" />
        </div>
      </div>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${getInsightBg(insight?.type)}`}>
          <div className="flex items-start space-x-3">
            <Icon 
              name={getInsightIcon(insight?.type)} 
              size={20} 
              className={getInsightColor(insight?.type)} 
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">{insight?.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight?.message}</p>
              {insight?.action && (
                <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto">
                  {insight?.action}
                  <Icon name="ArrowRight" size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {insights?.length > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevInsight}>
              <Icon name="ChevronLeft" size={16} />
            </Button>
            
            <div className="flex space-x-2">
              {insights?.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentInsight ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button variant="ghost" size="icon" onClick={nextInsight}>
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCard;