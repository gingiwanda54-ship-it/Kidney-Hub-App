import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, Phone, Share2, Loader2 } from 'lucide-react';
import { QuickReplies } from './QuickReplies';

export const AIChatInterface = ({
  messages = [],
  onSendMessage,
  onQuickReply,
  onToggleHealthContext,
  healthContextEnabled = false,
  isLoading = false,
  error = null,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message) => {
    // Simple markdown-like rendering
    const content = message.content || '';
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');

    return (
      <div
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
            message.role === 'user'
              ? 'bg-kidney-green text-white rounded-br-md'
              : 'bg-white text-kidney-charcoal border border-gray-200 rounded-bl-md'
          }`}
        >
          <div className="flex items-start gap-2">
            {message.role === 'assistant' && (
              <Bot className="w-5 h-5 text-kidney-green mt-0.5 flex-shrink-0" />
            )}
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
          {message.timestamp && (
            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md overflow-hidden">
      {/* Medical Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Medical Disclaimer:</strong> This AI assistant provides general health information only. 
          Always consult your healthcare provider for medical advice. In emergencies, call 082 911 immediately.
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-kidney-green mb-4" />
            <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-2">
              AI Health Assistant
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Ask me questions about kidney health, symptoms, medications, or lifestyle tips.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={message.id || index}>
                {renderMessage(message)}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Health Context Toggle */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white">
        <button
          onClick={onToggleHealthContext}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors ${
            healthContextEnabled
              ? 'bg-kidney-green text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Share my health context
        </button>
      </div>

      {/* Quick Replies */}
      {onQuickReply && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <QuickReplies onSelect={onQuickReply} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none resize-none"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-kidney-green text-white rounded-full hover:bg-kidney-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Emergency Button */}
        <a
          href="tel:082911"
          className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2 bg-kidney-red text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Emergency Hotline: 082 911
        </a>
      </div>
    </div>
  );
};

export default AIChatInterface;
