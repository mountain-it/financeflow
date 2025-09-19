import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { formatCurrency } from '../../../utils/formatCurrency';

const AIRecommendations = ({ budgetData, onApplyRecommendation }) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);
  const [dismissedRecommendations, setDismissedRecommendations] = useState([]);
  const { currency, locale } = usePreferences();

  const recommendations = [
    {
      id: 1,
      type: 'optimization',
      priority: 'high',
      title: 'Reduce Dining Out Budget',
      description: `You've spent 120% of your dining budget this month. Consider reducing by ${formatCurrency(200, currency, locale)}.`,
      impact: `Save ${formatCurrency(200, currency, locale)}/month`,
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
      type: 'opportunity',priority: 'medium',title: 'Increase Emergency Fund Allocation',description: 'You have extra budget capacity. Consider boosting your emergency fund.',impact: `Build ${formatCurrency(300, currency, locale)} more emergency savings`,category: 'Savings',
      currentAmount: 500,
      suggestedAmount: 800,
      reasoning: `Your current spending is 15% below budget, creating an opportunity to increase savings.\n\nCurrent situation:\n• Emergency fund: $2,400 (2.1 months expenses)\n• Recommended: $6,000 (6 months expenses)\n• Available budget surplus: $300/month\n\nThis adjustment will help you reach your emergency fund goal 8 months faster.`,
      actionItems: [
        'Set up automatic transfer of $300 to emergency fund','Open a high-yield savings account for better returns','Track progress with monthly milestones','Celebrate reaching 3-month expense coverage'
      ]
    },
    {
      id: 3,
      type: 'alert',priority: 'high',title: 'Transportation Costs Rising',description: 'Gas and maintenance costs are 40% higher than budgeted.',impact: `Budget shortfall of ${formatCurrency(180, currency, locale)}`,category: 'Transportation',
      currentAmount: 450,
      suggestedAmount: 630,
      reasoning: `Recent gas price increases and unexpected car maintenance have pushed transportation costs above budget.\n\nCost breakdown:\n• Gas: +$120 (price increase)\n• Maintenance: +$60 (unexpected repairs)\n• Insurance: On budget\n\nThis trend is likely to continue based on current market conditions.`,
      actionItems: [
        'Consider carpooling or public transit 2 days/week','Research gas stations with loyalty programs','Schedule regular maintenance to prevent costly repairs','Explore working from home options'
      ]
    },
    {
      id: 4,
      type: 'insight',priority: 'low',title: 'Seasonal Spending Pattern Detected',description: 'Your entertainment spending increases 60% during summer months.',impact: `Plan for ${formatCurrency(240, currency, locale)} seasonal increase`,category: 'Entertainment',
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

  const handleDismissRecommendation = (recommendationId) => {
    setDismissedRecommendations(prev => [...prev, recommendationId]);
  };

  
  return (
    <div className="bg-card rounded-lg border border-border financial-shadow-card">
      {/* Header */}
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

      {/* Recommendations List */}
      <div className="divide-y divide-border">
        {recommendations
          ?.filter(recommendation => !dismissedRecommendations.includes(recommendation.id))
          .map((recommendation) => {
          const isExpanded = expandedRecommendation === recommendation?.id;
          
          return (
            <div key={recommendation?.id} className="p-4 lg:p-6">
              {/* Recommendation Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityBg(recommendation?.priority)} flex-shrink-0`}>
                    <Icon
                      name={getTypeIcon(recommendation?.type)}
                      size={16}
                      className={getPriorityColor(recommendation?.priority)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">
                        {recommendation?.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        recommendation?.priority === 'high' ? 'bg-error/10 text-error' :
                        recommendation?.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>
                        {recommendation?.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 leading-tight">
                      {recommendation?.description}
                    </p>
                    
                    <div className="flex items-center flex-wrap gap-3 text-xs">
                      <span className="text-success font-medium">{recommendation?.impact}</span>
                      <span className="text-muted-foreground">• {recommendation?.category}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpanded(recommendation?.id)}
                  className="flex-shrink-0"
                >
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </Button>
              </div>

              {/* Budget Comparison */}
              {recommendation?.currentAmount && recommendation?.suggestedAmount && (
                <div className="flex items-center justify-between bg-muted/30 rounded-md p-2 mb-3">
                  <div className="text-xs text-muted-foreground">Budget Adjustment</div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-foreground font-medium">
                      {formatCurrency(recommendation?.currentAmount, currency, locale)}
                    </span>
                    <Icon name="ArrowRight" size={12} className="text-muted-foreground" />
                    <span className="text-primary font-semibold">
                      {formatCurrency(recommendation?.suggestedAmount, currency, locale)}
                    </span>
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-3 space-y-4 p-3 bg-muted/30 rounded-lg border">
                  {/* Analysis Section */}
                  <div>
                    <h5 className="font-medium text-foreground text-sm mb-2 flex items-center">
                      <Icon name="BarChart3" size={14} className="mr-2 text-primary" />
                      Analysis
                    </h5>
                    <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded border">
                      <div className="whitespace-pre-line leading-relaxed">
                        {recommendation?.reasoning}
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h5 className="font-medium text-foreground text-sm mb-2 flex items-center">
                      <Icon name="CheckCircle" size={14} className="mr-2 text-success" />
                      Recommended Actions
                    </h5>
                    <ul className="space-y-2 text-xs">
                      {recommendation?.actionItems?.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApplyRecommendation(recommendation)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Icon name="Check" size={14} className="mr-1" />
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismissRecommendation(recommendation.id)}
                  className="text-muted-foreground hover:bg-muted/30"
                >
                  <Icon name="X" size={14} className="mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 lg:p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="Sparkles" size={14} />
            <span>Updated daily based on your spending</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-muted/30"
          >
            <Icon name="RefreshCw" size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
