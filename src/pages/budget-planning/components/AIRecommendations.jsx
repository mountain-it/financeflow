import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIRecommendations = ({ budgetData, onApplyRecommendation }) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  const recommendations = [
    {
      id: 1,
      type: 'optimization',
      priority: 'high',
      title: 'Reduce Dining Out Budget',
      description: 'You\'ve spent 120% of your dining budget this month. Consider reducing by $200.',
      impact: 'Save $200/month',
      category: 'Food & Dining',
      currentAmount: 800,
      suggestedAmount: 600,
      reasoning: `Based on your spending patterns, you're consistently overspending on dining out. \n\nAnalyzing your transactions shows:\n• 15 restaurant visits this month\n• Average meal cost: $45\n• Peak spending on weekends\n\nRecommendation: Reduce dining budget and increase grocery budget for home cooking.`,
      actionItems: [
        'Set a weekly dining out limit of $100','Plan meals in advance to reduce impulse dining','Use grocery delivery to avoid restaurant temptations','Try cooking one new recipe per week'
      ]
    },
    {
      id: 2,
      type: 'opportunity',priority: 'medium',title: 'Increase Emergency Fund Allocation',description: 'You have extra budget capacity. Consider boosting your emergency fund.',impact: 'Build $300 more emergency savings',category: 'Savings',
      currentAmount: 500,
      suggestedAmount: 800,
      reasoning: `Your current spending is 15% below budget, creating an opportunity to increase savings.\n\nCurrent situation:\n• Emergency fund: $2,400 (2.1 months expenses)\n• Recommended: $6,000 (6 months expenses)\n• Available budget surplus: $300/month\n\nThis adjustment will help you reach your emergency fund goal 8 months faster.`,
      actionItems: [
        'Set up automatic transfer of $300 to emergency fund','Open a high-yield savings account for better returns','Track progress with monthly milestones','Celebrate reaching 3-month expense coverage'
      ]
    },
    {
      id: 3,
      type: 'alert',priority: 'high',title: 'Transportation Costs Rising',description: 'Gas and maintenance costs are 40% higher than budgeted.',impact: 'Budget shortfall of $180',category: 'Transportation',
      currentAmount: 450,
      suggestedAmount: 630,
      reasoning: `Recent gas price increases and unexpected car maintenance have pushed transportation costs above budget.\n\nCost breakdown:\n• Gas: +$120 (price increase)\n• Maintenance: +$60 (unexpected repairs)\n• Insurance: On budget\n\nThis trend is likely to continue based on current market conditions.`,
      actionItems: [
        'Consider carpooling or public transit 2 days/week','Research gas stations with loyalty programs','Schedule regular maintenance to prevent costly repairs','Explore working from home options'
      ]
    },
    {
      id: 4,
      type: 'insight',priority: 'low',title: 'Seasonal Spending Pattern Detected',description: 'Your entertainment spending increases 60% during summer months.',impact: 'Plan for $240 seasonal increase',category: 'Entertainment',
      currentAmount: 400,
      suggestedAmount: 400,
      reasoning: `Historical data shows consistent seasonal spending patterns:\n\nSummer months (Jun-Aug):\n• Entertainment: +60% average\n• Travel: +200% average\n• Utilities: +30% (AC usage)\n\nPlanning ahead can help smooth out these variations and prevent budget overruns.`,
      actionItems: [
        'Create a seasonal budget adjustment plan','Start saving $50/month in spring for summer activities','Look for free outdoor entertainment options','Set summer spending limits in advance'
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10';
      case 'medium': return 'bg-warning/10';
      case 'low': return 'bg-primary/10';
      default: return 'bg-muted/10';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'optimization': return 'TrendingUp';
      case 'opportunity': return 'Target';
      case 'alert': return 'AlertTriangle';
      case 'insight': return 'Lightbulb';
      default: return 'Info';
    }
  };

  const toggleExpanded = (recommendationId) => {
    setExpandedRecommendation(
      expandedRecommendation === recommendationId ? null : recommendationId
    );
  };

  const handleApplyRecommendation = (recommendation) => {
    onApplyRecommendation(recommendation);
    // Show success feedback
  };

  return (
    <div className="bg-card rounded-lg border border-border financial-shadow-card">
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Bot" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Personalized insights based on your spending patterns
            </p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {recommendations?.map((recommendation) => {
          const isExpanded = expandedRecommendation === recommendation?.id;
          
          return (
            <div key={recommendation?.id} className="p-4 lg:p-6">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPriorityBg(recommendation?.priority)}`}>
                  <Icon 
                    name={getTypeIcon(recommendation?.type)} 
                    size={20} 
                    className={getPriorityColor(recommendation?.priority)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-foreground">{recommendation?.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          recommendation?.priority === 'high' ? 'bg-error/10 text-error' :
                          recommendation?.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          {recommendation?.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {recommendation?.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-success font-medium">{recommendation?.impact}</span>
                        <span className="text-muted-foreground">• {recommendation?.category}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpanded(recommendation?.id)}
                    >
                      <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
                    </Button>
                  </div>

                  {/* Budget comparison */}
                  {recommendation?.currentAmount && recommendation?.suggestedAmount && (
                    <div className="flex items-center space-x-4 mb-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Current:</span>
                        <span className="font-medium text-foreground">
                          ${recommendation?.currentAmount?.toLocaleString()}
                        </span>
                      </div>
                      <Icon name="ArrowRight" size={14} className="text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Suggested:</span>
                        <span className="font-medium text-primary">
                          ${recommendation?.suggestedAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                      {/* Reasoning */}
                      <div>
                        <h5 className="font-medium text-foreground mb-2">Analysis</h5>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {recommendation?.reasoning}
                        </p>
                      </div>

                      {/* Action items */}
                      <div>
                        <h5 className="font-medium text-foreground mb-2">Recommended Actions</h5>
                        <ul className="space-y-2">
                          {recommendation?.actionItems?.map((action, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <Icon name="CheckCircle" size={14} className="text-success mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApplyRecommendation(recommendation)}
                      iconName="Check"
                      iconPosition="left"
                      iconSize={14}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                      iconSize={14}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="X"
                      iconPosition="left"
                      iconSize={14}
                      className="text-muted-foreground"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="p-4 lg:p-6 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Sparkles" size={16} />
            <span>Recommendations updated daily based on your spending patterns</span>
          </div>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left" iconSize={14}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;