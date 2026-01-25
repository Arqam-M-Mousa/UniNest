import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { forumAPI } from '../../services/api';

const categories = [
  'General',
  'Housing',
  'Roommates',
  'University',
  'Tips',
  'Questions',
];

export default function CreatePostScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('error'), t('pleaseEnterTitlePost'));
      return;
    }
    if (!content.trim()) {
      Alert.alert(t('error'), t('pleaseEnterContent'));
      return;
    }

    setLoading(true);
    try {
      await forumAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      Alert.alert(t('success'), t('postCreatedSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToCreatePost'));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    postButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    postButtonDisabled: {
      opacity: 0.6,
    },
    postButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    content: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 150,
      textAlignVertical: 'top',
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: colors.text,
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createPostTitle')}</Text>
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>{t('post')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('title')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterPostTitle')}
            placeholderTextColor={colors.secondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('category')}</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('content')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('whatsOnYourMind')}
            placeholderTextColor={colors.secondary}
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>
      </ScrollView>
    </View>
  );
}

