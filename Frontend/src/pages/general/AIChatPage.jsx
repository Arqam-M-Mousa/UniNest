import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiChatAPI } from '../../services/api';
import { SparklesIcon, PaperAirplaneIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function AIChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const assistantName = user?.role === 'Student' ? 'UniNest Mom' : 'Property Expert';
  const assistantIcon = user?.role === 'Student' ? '👩‍🍳' : '🏠';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');

    const tempUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      const response = await aiChatAPI.sendMessage(userMessage, conversationId);
      
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) return;

    if (conversationId) {
      try {
        await aiChatAPI.deleteConversation(conversationId);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{assistantIcon}</span>
                  <span>{assistantName}</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Assistant</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Clear chat"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <SparklesIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.role === 'Student' ? "Welcome! I'm here to help!" : 'Property Expert at Your Service'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {user?.role === 'Student'
                  ? 'Ask me about cooking, cleaning, budgeting, or any student life tips!'
                  : 'Get expert advice on property marketing, pricing, and tenant management!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <span className="text-base">{assistantIcon}</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {assistantName}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <form onSubmit={sendMessage} className="flex items-end gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder={
                user?.role === 'Student'
                  ? 'Ask me anything...'
                  : 'How can I help with your property?'
              }
              className="flex-1 resize-none rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 max-h-32"
              rows={1}
              maxLength={1000}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className={`p-3 rounded-xl transition-colors ${
                inputText.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
