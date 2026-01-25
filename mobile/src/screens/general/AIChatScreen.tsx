import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { aiChatAPI } from '../../services/api';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  TrashIcon, 
  Bars3Icon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import MarkdownRenderer from '../../components/MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  messageCount: number;
}

export default function AIChatScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const assistantName = user?.role === 'Student' ? t('aiChatUniNestAssistant') : t('aiChatPropertyExpert');
  const isStudent = user?.role === 'Student';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await aiChatAPI.getConversations();
      if (response && response.conversations) {
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (convId: string) => {
    setLoadingHistory(true);
    setSidebarVisible(false);
    try {
      const response = await aiChatAPI.getHistory(convId);
      setMessages(response.messages || []);
      setConversationId(convId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      Alert.alert(t('error'), 'Failed to load conversation');
    } finally {
      setLoadingHistory(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setConversationId(null);
    setSidebarVisible(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t('aiChatJustNow');
    if (diffMins < 60) return `${diffMins}${t('aiChatMinutesAgo')}`;
    if (diffHours < 24) return `${diffHours}${t('aiChatHoursAgo')}`;
    if (diffDays < 7) return `${diffDays}${t('aiChatDaysAgo')}`;
    return date.toLocaleDateString();
  };

  const getConversationTitle = (preview: string) => {
    if (!preview) return t('aiChatNewConversation');
    const cleaned = preview.replace(/[#*`_~]/g, '').trim();
    const title = cleaned.split('\n')[0].substring(0, 50);
    return title || t('aiChatNewConversation');
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setLoading(true);

    try {
      const response = await aiChatAPI.sendMessage(userMessage, conversationId || undefined);
      
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Alert.alert(t('error'), error.message || 'Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = (convId: string) => {
    Alert.alert(
      t('aiChatDeleteConversationTitle'),
      t('aiChatDeleteConversationMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await aiChatAPI.deleteConversation(convId);
              setConversations(prev => prev.filter(c => c.conversationId !== convId));
              if (conversationId === convId) {
                newChat();
              }
            } catch (error) {
              console.error('Failed to delete conversation:', error);
              Alert.alert(t('error'), 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantHeader}>
            <View style={[
              styles.assistantIconContainer,
              { backgroundColor: isStudent ? colors.primary : '#3B82F6' }
            ]}>
              <SparklesIcon size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.assistantName, { color: colors.primary }]}>
              {assistantName}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          {isUser ? (
            <Text
              style={[
                styles.messageText,
                { color: '#FFFFFF' },
              ]}
            >
              {item.content}
            </Text>
          ) : (
            <MarkdownRenderer content={item.content} />
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <SparklesIcon size={64} color={colors.primary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {user?.role === 'Student' ? t('aiChatWelcomeStudent') : t('aiChatWelcomeProperty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
        {user?.role === 'Student'
          ? t('aiChatStudentDescription')
          : t('aiChatLandlordDescription')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.sidebar, { backgroundColor: colors.card }]}
          >
            <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sidebarTitle, { color: colors.text }]}>{t('aiChatConversations')}</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <XMarkIcon size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={newChat}
              style={[
                styles.newChatButton,
                { 
                  backgroundColor: !conversationId ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <PlusIcon size={20} color={!conversationId ? '#FFFFFF' : colors.text} />
              <Text style={[
                styles.newChatText,
                { color: !conversationId ? '#FFFFFF' : colors.text }
              ]}>
                {t('aiChatNewChat')}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.conversationsList}>
              {conversations.length === 0 ? (
                <View style={styles.emptyConversations}>
                  <ChatBubbleLeftIcon size={48} color={colors.secondary} />
                  <Text style={[styles.emptyConversationsText, { color: colors.secondary }]}>
                    {t('aiChatNoConversationsYet')}
                  </Text>
                  <Text style={[styles.emptyConversationsSubtext, { color: colors.secondary }]}>
                    {t('aiChatStartChatting')}
                  </Text>
                </View>
              ) : (
                conversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.conversationId}
                    onPress={() => loadConversation(conv.conversationId)}
                    onLongPress={() => deleteConversation(conv.conversationId)}
                    style={[
                      styles.conversationItem,
                      {
                        backgroundColor: conversationId === conv.conversationId 
                          ? `${colors.primary}15` 
                          : 'transparent',
                        borderColor: conversationId === conv.conversationId
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <View style={[
                      styles.conversationIcon,
                      { backgroundColor: conversationId === conv.conversationId ? colors.primary : colors.background }
                    ]}>
                      <ChatBubbleLeftIcon 
                        size={16} 
                        color={conversationId === conv.conversationId ? '#FFFFFF' : colors.secondary} 
                      />
                    </View>
                    <View style={styles.conversationContent}>
                      <Text 
                        style={[
                          styles.conversationTitle,
                          { color: conversationId === conv.conversationId ? colors.primary : colors.text }
                        ]}
                        numberOfLines={1}
                      >
                        {getConversationTitle(conv.lastMessagePreview)}
                      </Text>
                      <View style={styles.conversationMeta}>
                        <ClockIcon size={12} color={colors.secondary} />
                        <Text style={[styles.conversationTime, { color: colors.secondary }]}>
                          {formatTimeAgo(conv.lastMessageAt)}
                        </Text>
                        <Text style={[styles.conversationDot, { color: colors.secondary }]}>•</Text>
                        <Text style={[styles.conversationCount, { color: colors.secondary }]}>
                          {conv.messageCount} {t('aiChatMessages')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Bars3Icon size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleContainer}>
            <View style={[
              styles.headerIconContainer,
              { backgroundColor: isStudent ? colors.primary : '#3B82F6' }
            ]}>
              <SparklesIcon size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {assistantName}
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            {user?.role === 'Student' ? t('aiChatYourCaringAssistant') : t('aiChatPropertyMarketingExpert')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <XMarkIcon size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder={user?.role === 'Student' ? t('aiChatAskMeAnything') : t('aiChatHowCanIHelpPropertyInput')}
            placeholderTextColor={colors.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() && !loading ? colors.primary : colors.border },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <PaperAirplaneIcon size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: '80%',
    height: '100%',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  newChatText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyConversations: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyConversationsText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyConversationsSubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  conversationIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: 11,
    marginLeft: 4,
  },
  conversationDot: {
    fontSize: 11,
    marginHorizontal: 6,
  },
  conversationCount: {
    fontSize: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messagesListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  assistantIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assistantName: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 15,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

