import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ConversationHistory = ({ isVisible, onConversationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const conversations = [
    {
      id: 1,
      title: 'Budget Optimization Discussion',
      lastMessage: 'Based on your spending patterns, I recommend...',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      messageCount: 12,
      category: 'Budget Planning'
    },
    {
      id: 2,
      title: 'Monthly Expense Analysis',
      lastMessage: 'Your dining expenses have increased by 15%...',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 8,
      category: 'Expense Analysis'
    },
    {
      id: 3,
      title: 'Emergency Fund Planning',
      lastMessage: 'To build a 6-month emergency fund...',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      messageCount: 15,
      category: 'Goal Planning'
    },
    {
      id: 4,
      title: 'Investment Recommendations',
      lastMessage: 'Consider diversifying your portfolio with...',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      messageCount: 20,
      category: 'Investment'
    },
    {
      id: 5,
      title: 'Bill Payment Reminders',
      lastMessage: 'Your credit card payment is due in 3 days...',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      messageCount: 6,
      category: 'Bill Management'
    },
    {
      id: 6,
      title: 'Spending Pattern Review',
      lastMessage: 'I noticed some unusual spending patterns...',
      timestamp: new Date(Date.now() - 604800000), // 1 week ago
      messageCount: 10,
      category: 'Analysis'
    }
  ];

  const filteredConversations = conversations?.filter(conv =>
    conv?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    conv?.category?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    conv?.lastMessage?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Budget Planning': 'text-primary bg-primary/10',
      'Expense Analysis': 'text-warning bg-warning/10',
      'Goal Planning': 'text-accent bg-accent/10',
      'Investment': 'text-success bg-success/10',
      'Bill Management': 'text-error bg-error/10',
      'Analysis': 'text-secondary bg-secondary/10'
    };
    return colors?.[category] || 'text-muted-foreground bg-muted/10';
  };

  if (!isVisible) return null;

  return (
    <div className="hidden md:block w-72 xl:w-80 border-r border-border bg-card overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Conversations</h3>
          <Button variant="ghost" size="icon">
            <Icon name="Plus" size={16} />
          </Button>
        </div>
        
        <Input
          type="search"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full"
        />
      </div>
      <div className="p-2 space-y-1">
        {filteredConversations?.map((conversation) => (
          <button
            key={conversation?.id}
            onClick={() => onConversationSelect(conversation)}
            className="w-full p-3 rounded-lg hover:bg-muted/50 financial-transition text-left group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary financial-transition line-clamp-1">
                  {conversation?.title}
                </h4>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatTimestamp(conversation?.timestamp)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {conversation?.lastMessage}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(conversation?.category)}`}>
                  {conversation?.category}
                </span>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Icon name="MessageCircle" size={12} />
                  <span className="text-xs">{conversation?.messageCount}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {filteredConversations?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No conversations found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms</p>
        </div>
      )}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full">
          <Icon name="Archive" size={16} className="mr-2" />
          View Archived
        </Button>
      </div>
    </div>
  );
};

export default ConversationHistory;