import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChatInput = ({ onSendMessage, isTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !disabled) {
      onSendMessage(message?.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef?.current?.scrollHeight}px`;
    }
  }, [message]);

  const quickSuggestions = [
    "What\'s my spending this month?",
    "Help me save money",
    "Set a budget goal",
    "Track my expenses"
  ];

  return (
    <div className="border-t border-border bg-card p-4 space-y-3">
      {/* Quick Suggestions */}
      {message === '' && (
        <div className="flex flex-wrap gap-2">
          {quickSuggestions?.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full border border-border financial-transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your finances..."
            disabled={disabled}
            className="w-full min-h-[44px] max-h-32 px-4 py-3 pr-12 bg-background border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent financial-transition disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 ${
              isRecording ? 'text-error animate-pulse' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={isRecording ? 'MicOff' : 'Mic'} size={16} />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="default"
          size="icon"
          disabled={!message?.trim() || disabled}
          className="w-11 h-11 rounded-full flex-shrink-0"
        >
          {isTyping ? (
            <Icon name="Loader2" size={20} className="animate-spin" />
          ) : (
            <Icon name="Send" size={20} />
          )}
        </Button>
      </form>
      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-2 text-error">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Recording...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            className="text-error hover:text-error/80"
          >
            Stop
          </Button>
        </div>
      )}
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm">AI is typing...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;