import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import HeaderBar from '../../components/ui/HeaderBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import ChatMessage from './components/ChatMessage';
import ConversationStarters from './components/ConversationStarters';
import ChatInput from './components/ChatInput';
import FinancialSummaryWidget from './components/FinancialSummaryWidget';
import ConversationHistory from './components/ConversationHistory';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import aiService from '../../services/aiService';

const AIFinancialAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [userContext, setUserContext] = useState({});
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load user's financial context
  useEffect(() => {
    if (user?.id) {
      loadUserContext();
    }
  }, [user?.id]);

  const loadUserContext = async () => {
    try {
      const context = await aiService.getUserFinancialContext(user.id, supabase);
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  // Initial AI welcome message
  const initialMessages = [
    {
      id: 1,
      sender: 'ai',
      type: 'text',
      content: `Hello! I'm your AI Financial Assistant powered by advanced AI technology. I'm here to help you manage your finances, optimize your budget, and achieve your financial goals.\n\nI can assist you with:\n• Personalized budget planning and optimization\n• Expense analysis and spending insights\n• Financial goal setting and tracking\n• Investment recommendations\n• Bill management and payment optimization\n\nI have access to your financial data to provide personalized advice. What would you like to explore today?`,
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered'
    }
  ];

  useEffect(() => {
    if (messages?.length === 0) {
      setMessages(initialMessages);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Real AI response generation
  const generateAIResponse = async (userMessage) => {
    try {
      const response = await aiService.generateFinancialAdvice(userMessage, userContext);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        type: 'text',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment, or feel free to ask about budget planning, expense tracking, or financial goals.',
        quickActions: [
          { label: 'Budget Help', icon: 'PieChart', type: 'budget_help' },
          { label: 'Expense Analysis', icon: 'Receipt', type: 'expense_analysis' }
        ]
      };
    }
  };

  // Toggle functions
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  const toggleSummary = () => {
    setShowSummary(prev => !prev);
  };

  const handleStarterClick = (starter) => {
    handleSendMessage(starter);
  };

  const handleConversationSelect = (conversation) => {
    // Handle conversation selection
    console.log('Selected conversation:', conversation);
  };

  const handleQuickAction = (action) => {
    switch (action.type) {
      case 'view_budget':
        // Navigate to budget page or show budget details
        console.log('View budget action');
        break;
      case 'set_alert':
        // Set up spending alert
        console.log('Set alert action');
        break;
      case 'create_goal':
        // Create financial goal
        console.log('Create goal action');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText?.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: messageText,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setShowStarters(false);
    setIsTyping(true);

    try {
      // Generate real AI response
      const aiResponseData = await generateAIResponse(messageText);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        ...aiResponseData,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in AI response:', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        type: 'text',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Financial Assistant - FinanceFlow</title>
        <meta name="description" content="Get personalized financial advice and insights from your AI-powered financial assistant. Budget optimization, expense analysis, and goal planning made easy." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <HeaderBar />
        
        <div className="flex h-screen pt-16">
          {/* Conversation History Sidebar */}
          <ConversationHistory 
            isVisible={showHistory}
            onConversationSelect={handleConversationSelect}
          />
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header with Toggle Controls */}
            <div className="border-b border-border bg-card px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleHistory}
                    className={`p-2 rounded-lg border border-border hover:bg-muted/50 financial-transition ${
                      showHistory ? 'bg-primary/10 border-primary/30' : 'bg-card'
                    }`}
                    title="Toggle conversation history"
                  >
                    <Icon name="MessageSquare" size={16} className={showHistory ? 'text-primary' : 'text-muted-foreground'} />
                  </button>
                  <h1 className="text-lg font-semibold text-foreground">AI Financial Assistant</h1>
                </div>
                <button
                  onClick={toggleSummary}
                  className={`p-2 rounded-lg border border-border hover:bg-muted/50 financial-transition ${
                    showSummary ? 'bg-primary/10 border-primary/30' : 'bg-card'
                  }`}
                  title="Toggle financial summary"
                >
                  <Icon name="BarChart3" size={16} className={showSummary ? 'text-primary' : 'text-muted-foreground'} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4"
            >
              {/* Welcome Message & Starters */}
              {messages?.length <= 1 && showStarters && (
                <div className="max-w-4xl mx-auto mb-8">
                  <ConversationStarters 
                    onStarterClick={handleStarterClick}
                    isVisible={showStarters}
                  />
                </div>
              )}

              {/* Messages */}
              <div className="max-w-4xl mx-auto space-y-4">
                {messages?.map((message) => (
                  <ChatMessage
                    key={message?.id}
                    message={message}
                    onQuickAction={handleQuickAction}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-border bg-card">
              <div className="max-w-4xl mx-auto">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isTyping={isTyping}
                  disabled={isTyping}
                />
              </div>
            </div>
          </div>

          {/* Financial Summary Widget */}
          <FinancialSummaryWidget isVisible={showSummary} />
        </div>

        <BottomTabNavigation />
      </div>
    </>
  );
};

export default AIFinancialAssistant;