import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Update AIInsightsPanel to accept onRefresh prop
const AIInsightsPanel = ({ insights, onRefresh }) => {
  const [expandedInsight, setExpandedInsight] = useState(null);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'AlertTriangle';
      case 'opportunity':
        return 'TrendingUp';
      case 'achievement':
        return 'Award';
      case 'recommendation':
        return 'Lightbulb';
      default:
        return 'Info';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'opportunity':
        return 'text-success bg-success/10 border-success/20';
      case 'achievement':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'recommendation':
        return 'text-primary bg-primary/10 border-primary/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const toggleInsight = (id) => {
    setExpandedInsight(expandedInsight === id ? null : id);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 financial-shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Bot" size={16} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Financial Insights</h3>
        </div>
        <Button variant="ghost" size="sm" iconName="RefreshCw" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      <div className="space-y-3">
        {insights?.map((insight) => (
          <div
            key={insight?.id}
            className={`border rounded-lg p-4 financial-transition ${getInsightColor(insight?.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Icon 
                  name={getInsightIcon(insight?.type)} 
                  size={20} 
                  className={insight?.type === 'warning' ? 'text-warning' : 
                           insight?.type === 'opportunity' ? 'text-success' :
                           insight?.type === 'achievement' ? 'text-accent' :
                           insight?.type === 'recommendation' ? 'text-primary' : 'text-muted-foreground'}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1">{insight?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight?.summary}</p>
                  
                  {insight?.metrics && (
                    <div className="flex flex-wrap gap-4 mb-2">
                      {insight?.metrics?.map((metric, index) => (
                        <div key={index} className="text-xs">
                          <span className="text-muted-foreground">{metric?.label}: </span>
                          <span className="font-medium text-foreground">{metric?.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedInsight === insight?.id && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-sm text-foreground mb-3">{insight?.details}</p>
                      
                      {insight?.recommendations && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-foreground">Recommendations:</h5>
                          <ul className="space-y-1">
                            {insight?.recommendations?.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <Icon name="ArrowRight" size={12} className="mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {insight?.actions && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {insight?.actions?.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleInsight(insight?.id)}
                iconName={expandedInsight === insight?.id ? "ChevronUp" : "ChevronDown"}
                className="ml-2 flex-shrink-0"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: {new Date()?.toLocaleString()}</span>
          <Button variant="ghost" size="sm" iconName="MessageSquare">
            Ask AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;