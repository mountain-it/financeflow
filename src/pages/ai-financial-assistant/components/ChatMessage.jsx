import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatMessage = ({ message, onQuickAction }) => {
  const isUser = message?.sender === 'user';
  const isAI = message?.sender === 'ai';

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessageContent = () => {
    if (message?.type === 'text') {
      return (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message?.content}
          </p>
          {message?.quickActions && message?.quickActions?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message?.quickActions?.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  iconName={action?.icon}
                  iconPosition="left"
                  onClick={() => onQuickAction(action)}
                  className="text-xs"
                >
                  {action?.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (message?.type === 'chart') {
      return (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{message?.content}</p>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Spending Breakdown</h4>
              <Icon name="PieChart" size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {message?.chartData?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item?.color }}
                    ></div>
                    <span className="text-sm">{item?.category}</span>
                  </div>
                  <span className="text-sm font-medium">${item?.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (message?.type === 'recommendation') {
      return (
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">Financial Recommendation</h4>
              <p className="text-sm leading-relaxed">{message?.content}</p>
            </div>
          </div>
          {message?.recommendations && (
            <div className="space-y-2">
              {message?.recommendations?.map((rec, index) => (
                <div key={index} className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-accent">{rec?.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{rec?.description}</p>
                      <p className="text-sm font-medium text-accent mt-2">
                        Potential savings: ${rec?.savings}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                      onClick={() => onQuickAction({ type: 'implement', data: rec })}
                      className="ml-2"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <p className="text-sm leading-relaxed">{message?.content}</p>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">JD</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Bot" size={16} color="white" />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex-1">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-card border border-border rounded-bl-md financial-shadow-card'
            }`}
          >
            {renderMessageContent()}
          </div>
          
          {/* Timestamp */}
          <div className={`flex items-center mt-1 space-x-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message?.timestamp)}
            </span>
            {isUser && message?.status && (
              <Icon 
                name={message?.status === 'sent' ? 'Check' : message?.status === 'delivered' ? 'CheckCheck' : 'Clock'} 
                size={12} 
                className={`${message?.status === 'delivered' ? 'text-accent' : 'text-muted-foreground'}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;