import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiChatAPI } from '../../services/api';
import {
  PaperAirplaneIcon,
  ArrowPathIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Alert from '../../components/common/Alert';

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ isOpen: false, conversationId: null });
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const isStudent = user?.role === 'Student';
  const assistantName = isStudent ? 'UniNest Assistant' : 'Property Expert';

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await aiChatAPI.getConversations();
      console.log('Loaded conversations:', response);
      if (response && response.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (convId) => {
    setLoadingHistory(true);
    try {
      const response = await aiChatAPI.getHistory(convId);
      setMessages(response.messages || []);
      setConversationId(convId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    setDeleteAlert({ isOpen: true, conversationId: convId });
  };

  const confirmDelete = async () => {
    const convId = deleteAlert.conversationId;
    if (!convId) return;
    
    try {
      await aiChatAPI.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.conversationId !== convId));
      if (conversationId === convId) {
        newChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');

    const tempUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      const response = await aiChatAPI.sendMessage(userMessage, conversationId);
      
      // Set conversation ID if this is a new conversation
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Always refresh conversations list after successful message
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const getConversationTitle = (preview) => {
    if (!preview) return 'New conversation';
    const cleaned = preview.replace(/[#*`_~]/g, '').trim();
    const title = cleaned.split('\n')[0].substring(0, 50);
    return title || 'New conversation';
  };

  return (
    <>
      <Alert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false, conversationId: null })}
        title="Delete Conversation?"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        type="warning"
      />
      <div className="flex h-[calc(100vh-64px)] bg-[var(--color-bg)]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0`}>
        <div className="w-80 h-full flex flex-col themed-surface border-r themed-border">
          {/* Sidebar Header */}
          <div className="p-4">
            <button
              onClick={newChat}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                !conversationId 
                  ? 'bg-[var(--color-accent)] text-white' 
                  : 'border themed-border hover:bg-[var(--color-surface-alt)] text-[var(--color-text)]'
              }`}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-sm font-medium">New chat</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <ChatBubbleLeftIcon className="w-12 h-12 themed-text-soft mb-3 opacity-50" />
                <p className="text-sm themed-text-soft text-center">No conversations yet</p>
                <p className="text-xs themed-text-soft text-center mt-1">Start chatting to create one!</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-medium themed-text-soft px-2 py-2 uppercase tracking-wider">Recent Chats</p>
                {conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv.conversationId)}
                    className={`w-full flex flex-col px-3 py-3 rounded-xl text-left group transition-all duration-200 ${
                      conversationId === conv.conversationId
                        ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30'
                        : 'hover:bg-[var(--color-surface-alt)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        conversationId === conv.conversationId
                          ? 'bg-[var(--color-accent)]'
                          : 'bg-[var(--color-surface-alt)]'
                      }`}>
                        <ChatBubbleLeftIcon className={`w-4 h-4 ${
                          conversationId === conv.conversationId ? 'text-white' : 'themed-text-soft'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          conversationId === conv.conversationId 
                            ? 'text-[var(--color-accent)]' 
                            : 'text-[var(--color-text)]'
                        }`}>
                          {getConversationTitle(conv.lastMessagePreview)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ClockIcon className="w-3 h-3 themed-text-soft" />
                          <span className="text-xs themed-text-soft">
                            {formatTimeAgo(conv.lastMessageAt)}
                          </span>
                          <span className="text-xs themed-text-soft">•</span>
                          <span className="text-xs themed-text-soft">
                            {conv.messageCount} msg
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.conversationId, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all duration-200 self-center"
                        title="Delete conversation"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b themed-border themed-surface">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-all duration-200"
          >
            <Bars3Icon className="w-5 h-5 text-[var(--color-text)]" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isStudent 
                ? 'bg-gradient-to-br from-pink-500 to-orange-400' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[var(--color-text)]">{assistantName}</h1>
              <p className="text-xs themed-text-soft">
                {isStudent ? 'Your caring assistant' : 'Property marketing expert'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <ArrowPathIcon className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                isStudent 
                  ? 'bg-gradient-to-br from-pink-500 to-orange-400' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2 text-center">
                {isStudent ? 'What can I help with?' : 'How can I help your property?'}
              </h1>
              <p className="themed-text-soft text-center max-w-md">
                {isStudent
                  ? 'Ask me about cooking, cleaning, budgeting, or any student life tips!'
                  : 'Get expert advice on marketing, pricing, and tenant management.'}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-6">
              {messages.map((message) => (
                <div key={message.id} className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[var(--color-accent)] text-white px-5 py-3 rounded-3xl rounded-br-md shadow-sm">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isStudent 
                          ? 'bg-gradient-to-br from-pink-500 to-orange-400' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-[var(--color-text)] bg-[var(--color-surface)] rounded-3xl rounded-tl-md px-5 py-4 shadow-sm border themed-border">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="mb-6 flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isStudent 
                      ? 'bg-gradient-to-br from-pink-500 to-orange-400' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 py-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t themed-border themed-surface">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={sendMessage}>
              <div className="relative flex items-end gap-3 p-2 rounded-2xl border themed-border bg-[var(--color-surface-alt)] focus-within:border-[var(--color-accent)] transition-colors">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder={isStudent ? 'Ask me anything...' : 'How can I help with your property?'}
                  className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-soft)] py-2 px-3 resize-none focus:outline-none text-[15px] max-h-[200px]"
                  rows={1}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    inputText.trim() && !loading
                      ? 'bg-[var(--color-accent)] text-white hover:opacity-90'
                      : 'bg-[var(--color-border)] text-[var(--color-text-soft)] cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
            <p className="text-xs themed-text-soft text-center mt-2">
              {assistantName} can make mistakes. Consider checking important info.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
