import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import chatService from '../../services/chatService';
import userContextService from '../../services/userContextService';

const AIFinancialAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const currentConversationId = currentConversation?.id || null;
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
      // Use the dedicated user context service (correct schema)
      const context = await userContextService.getUserFinancialContext(user.id);
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  // Initial AI welcome message (for empty/new conversations)
  const initialMessages = useMemo(() => ([
    {
      id: 'welcome',
      sender: 'ai',
      type: 'text',
      content: `Hello! I'm your Virtual Financial Assistant. I can help with budget planning, expense insights, goals, and more. Ask me anything about your account to get started.`,
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered'
    }
  ]), []);
  useEffect(() => {
    if (messages?.length === 0) setMessages(initialMessages);
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
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to ask about budget planning, expense tracking, or financial goals.",
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
    handleSendMessage(starter.description);
  };

  // Map DB row to UI message
  const mapRowToMessage = (row) => ({
    id: row.id,
    sender: row.role === 'user' ? 'user' : 'ai',
    type: row.type || 'text',
    content: row.content,
    quickActions: row.quick_actions || null,
    provider: row.provider || null,
    timestamp: row.created_at ? new Date(row.created_at) : new Date(),
    status: row.role === 'user' ? 'delivered' : undefined,
  });

  const handleConversationSelect = async (conversation) => {
    if (!conversation?.id || !user?.id) return;
    setCurrentConversation(conversation);
    setShowStarters(false);
    try {
      const rows = await chatService.listMessages(conversation.id);
      setMessages(rows.map(mapRowToMessage));
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  };

  const handleNewConversation = async () => {
    if (!user?.id) return;
    try {
      const conv = await chatService.createConversation(user.id, { title: null });
      setCurrentConversation(conv);
      setMessages(initialMessages);
      setShowStarters(true);
    } catch (e) {
      console.error('Failed to create conversation:', e);
    }
  };

  const handleQuickAction = async (action) => {
    try {
      const res = await aiService.applyQuickAction(action, user?.id);
      if (res?.ok) {
        // Refresh context after potential writes
        await loadUserContext();
        if (res.navigateTo) {
          window.location.href = res.navigateTo;
        }
      } else {
        console.warn('Quick action failed', res?.error);
      }
    } catch (e) {
      console.error('Quick action error', e);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText?.trim()) return;
    setIsTyping(true);
    setShowStarters(false);

    // Optimistically show user message
    const tempUserId = `temp-user-${Date.now()}`;
    const optimisticUser = {
      id: tempUserId,
      sender: 'user',
      type: 'text',
      content: messageText,
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages((prev) => [...prev, optimisticUser]);

    // Ensure conversation exists (best-effort)
    let convo = currentConversation;
    if (!convo?.id) {
      try {
        convo = await chatService.createConversation(user.id, { title: null });
        setCurrentConversation(convo);
      } catch (e) {
        console.warn('Could not create conversation (ephemeral fallback):', e?.message);
      }
    }

    // Persist user message (best-effort)
    if (convo?.id) {
      try {
        const userRow = await chatService.addMessage(convo.id, user.id, {
          role: 'user',
          content: messageText,
          type: 'text',
          provider: null,
          metadata: null,
        });
        setMessages((prev) => prev.map((m) => (m.id === tempUserId ? mapRowToMessage(userRow) : m)));
        if (!convo.title) {
          const title = messageText.slice(0, 60);
          try { await chatService.updateConversationTitle(convo.id, title); } catch {}
          setCurrentConversation((prev) => (prev ? { ...prev, title } : prev));
        }
      } catch (e) {
        console.warn('Persist user message failed; continuing ephemeral:', e?.message);
      }
    }

    // Generate AI response regardless of persistence
    try {
      const aiResponseData = await generateAIResponse(messageText);
      const tempAiId = `temp-ai-${Date.now()}`;
      const aiMsg = {
        id: tempAiId,
        sender: 'ai',
        type: aiResponseData?.type || 'text',
        content: aiResponseData?.content || '',
        quickActions: aiResponseData?.quickActions || null,
        provider: aiResponseData?.provider || null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (convo?.id) {
        try {
          const aiRow = await chatService.addMessage(convo.id, user.id, {
            role: 'ai',
            content: aiResponseData?.content || '',
            type: aiResponseData?.type || 'text',
            quickActions: aiResponseData?.quickActions || null,
            provider: aiResponseData?.provider || null,
            metadata: null,
          });
          setMessages((prev) => prev.map((m) => (m.id === tempAiId ? mapRowToMessage(aiRow) : m)));
        } catch (e) {
          console.warn('Persist AI message failed; kept ephemeral:', e?.message);
        }
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          type: 'text',
          content: 'I apologize, I could not generate a response just now. Please try again shortly.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Bootstrap conversation: open last or show starter
  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;
      try {
        const list = await chatService.listConversations(user.id);
        if (list.length > 0) {
          await handleConversationSelect(list[0]);
        } else {
          setMessages(initialMessages);
          setShowStarters(true);
        }
      } catch (e) {
        console.error('Failed to load conversations', e);
      }
    };
    init();
  }, [user?.id]);

  // Realtime new messages for current conversation
  useEffect(() => {
    if (!currentConversationId) return;
    const channel = supabase
      .channel(`ai_messages:${currentConversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_messages', filter: `conversation_id=eq.${currentConversationId}` },
        (payload) => {
          const row = payload?.new;
          if (!row) return;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, mapRowToMessage(row)]));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentConversationId]);

  return (
    <>
      <Helmet>
        <title>AI Financial Assistant - FinanceFlow</title>
        <meta name="description" content="Get personalized financial advice and insights from your AI-powered financial assistant. Budget optimization, expense analysis, and goal planning made easy." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <HeaderBar />
        <main className="pt-16 pb-20 lg:pb-4 lg:pl-64">
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Conversation History Sidebar */}
          <ConversationHistory 
            isVisible={showHistory}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            currentConversationId={currentConversationId}
            onClose={() => setShowHistory(false)}
            onArchived={(archivedId) => {
              if (archivedId === currentConversationId) {
                setCurrentConversation(null);
                setMessages(initialMessages);
                setShowStarters(true);
              }
            }}
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
              className="flex-1 overflow-y-auto p-4 pb-28 lg:pb-8"
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
            <div className="sticky bottom-0 z-10 bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur">
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

        </main>

        <BottomTabNavigation />
      </div>
    </>
  );
};

export default AIFinancialAssistant;
