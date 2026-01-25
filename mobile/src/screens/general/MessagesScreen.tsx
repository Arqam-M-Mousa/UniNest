import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { conversationsAPI } from '../../services/api';
import { format } from 'date-fns';

export default function MessagesScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (route.params?.conversationId) {
      loadConversationById(route.params.conversationId);
    } else if (route.params?.recipientId) {
      handleNewConversation(route.params.recipientId, route.params.recipientName);
    }
  }, [route.params?.conversationId, route.params?.recipientId]);

  const loadConversations = async () => {
    try {
      const response = await conversationsAPI.list();
      const data = response?.data?.conversations || response?.conversations || response?.data || [];
      const convList = Array.isArray(data) ? data : [];
      // Add otherUser field to each conversation
      const withOtherUser = convList.map((conv: any) => ({
        ...conv,
        otherUser: conv.studentId === user?.id ? conv.landlord : conv.student,
      }));
      setConversations(withOtherUser);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationById = async (conversationId: string) => {
    try {
      // First check if we have it in the list
      let conv = conversations.find(c => c.id === conversationId);
      
      // If not found, reload conversations to get the new one
      if (!conv) {
        const response = await conversationsAPI.list();
        const data = response?.data?.conversations || response?.conversations || response?.data || [];
        const convList = Array.isArray(data) ? data : [];
        // Add otherUser field to each conversation
        const withOtherUser = convList.map((c: any) => ({
          ...c,
          otherUser: c.studentId === user?.id ? c.landlord : c.student,
        }));
        setConversations(withOtherUser);
        conv = withOtherUser.find((c: any) => c.id === conversationId);
      }
      
      if (conv) {
        setSelectedConversation(conv);
        await loadMessages(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await conversationsAPI.listMessages(conversationId);
      const data = response?.data?.messages || response?.messages || response?.data || [];
      setMessages(Array.isArray(data) ? data.reverse() : []); // Reverse for inverted FlatList
      await conversationsAPI.markRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const loadConversation = async (conv: any) => {
    // Add otherUser field if not present
    const convWithOther = {
      ...conv,
      otherUser: conv.otherUser || (conv.studentId === user?.id ? conv.landlord : conv.student),
    };
    setSelectedConversation(convWithOther);
    await loadMessages(conv.id);
  };

  const handleNewConversation = async (recipientId: string, recipientName: string) => {
    try {
      // Check if conversation already exists with this user
      const existingConv = conversations.find((c: any) => 
        c.otherUser?.id === recipientId
      );
      
      if (existingConv) {
        // Load existing conversation
        await loadConversation(existingConv);
      } else {
        // Create new conversation
        const response = await conversationsAPI.create({
          studentId: user?.role === 'student' ? user?.id : recipientId,
          landlordId: user?.role === 'landlord' ? user?.id : recipientId,
          propertyId: route.params?.itemId || null,
        });
        const newConv = response?.data || response;
        
        // Set up the conversation with recipient info
        const convWithOther = {
          ...newConv,
          otherUser: {
            id: recipientId,
            firstName: recipientName?.split(' ')[0] || 'User',
            lastName: recipientName?.split(' ').slice(1).join(' ') || '',
          },
        };
        
        setSelectedConversation(convWithOther);
        setMessages([]);
        
        // Reload conversations list to include the new one
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await conversationsAPI.sendMessage(selectedConversation.id, {
        content: newMessage,
        attachmentsJson: null,
      });
      setNewMessage('');
      await loadMessages(selectedConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    conversationsList: {
      flex: 1,
    },
    conversationItem: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    conversationAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    conversationAvatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    conversationInfo: {
      flex: 1,
    },
    conversationName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    conversationPreview: {
      fontSize: 14,
      color: colors.secondary,
    },
    conversationTime: {
      fontSize: 12,
      color: colors.secondary,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesHeader: {
      paddingTop: insets.top + 10,
      paddingBottom: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
      padding: 5,
    },
    conversationHeaderTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    messagesList: {
      flex: 1,
      padding: 15,
    },
    messageItem: {
      maxWidth: '80%',
      marginBottom: 10,
      padding: 12,
      borderRadius: 12,
    },
    myMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
    },
    theirMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.card,
    },
    messageText: {
      fontSize: 16,
      color: colors.text,
    },
    myMessageText: {
      color: '#FFFFFF',
    },
    messageTime: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingTop: 10,
      paddingHorizontal: 10,
      paddingBottom: Math.max(insets.bottom, 10),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
      color: colors.text,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    header: {
      paddingTop: insets.top + 10,
      paddingBottom: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
    },
    avatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });

  if (selectedConversation) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.messagesHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <ChevronLeftIcon size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.conversationHeaderTitle}>
            {selectedConversation.otherUser?.firstName} {selectedConversation.otherUser?.lastName}
          </Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          inverted
          renderItem={({ item }) => {
            const isMyMessage = item.senderId === user?.id;
            return (
              <View
                style={[
                  styles.messageItem,
                  isMyMessage ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMyMessage && styles.myMessageText,
                  ]}
                >
                  {item.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isMyMessage && styles.myMessageText,
                  ]}
                >
                  {format(new Date(item.createdAt), 'HH:mm')}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('typeMessage')}
            placeholderTextColor={colors.secondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <PaperAirplaneIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('messages')}</Text>
      </View>
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => loadConversation(item)}
          >
            {item.otherUser?.avatarUrl || item.otherUser?.profilePictureUrl ? (
              <Image
                source={{ uri: item.otherUser?.avatarUrl || item.otherUser?.profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.conversationAvatar}>
                <Text style={styles.conversationAvatarText}>
                  {item.otherUser?.firstName?.[0]}{item.otherUser?.lastName?.[0]}
                </Text>
              </View>
            )}
            <View style={styles.conversationInfo}>
              <Text style={styles.conversationName}>
                {item.otherUser?.firstName} {item.otherUser?.lastName}
              </Text>
              <Text style={styles.conversationPreview} numberOfLines={1}>
                {item.lastMessage?.content || t('noMessages')}
              </Text>
            </View>
            {item.lastMessage && (
              <Text style={styles.conversationTime}>
                {format(new Date(item.lastMessage.createdAt), 'MMM d')}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ChatBubbleLeftRightIcon size={64} color={colors.secondary} />
            <Text style={styles.emptyText}>{t('noConversationsYet')}</Text>
            <Text style={styles.emptySubtext}>
              {t('startConversationHint')}
            </Text>
          </View>
        }
      />
      )}
    </View>
  );
}

