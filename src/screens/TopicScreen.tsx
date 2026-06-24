import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import CollapsibleSection from '../components/CollapsibleSection';
import BookmarkButton from '../components/BookmarkButton';
import { getTopicById, getCategoryById } from '../data';
import { Topic, Category } from '../types';
import { isOfflineCached, saveOfflineArticle, removeOfflineArticle } from '../utils/storage';

type RootStackParamList = {
  Home: undefined;
  Category: { category: Category };
  Topic: { categoryId: string; topicId: string };
  Search: undefined;
  Bookmarks: undefined;
  Offline: undefined;
};

type TopicRouteProp = RouteProp<RootStackParamList, 'Topic'>;

export default function TopicScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TopicRouteProp>();
  const { categoryId, topicId } = route.params;

  const topic = getTopicById(categoryId, topicId);
  const category = getCategoryById(categoryId);
  const [offlineSaved, setOfflineSaved] = useState(false);

  useEffect(() => {
    if (topic) {
      isOfflineCached(topicId).then(setOfflineSaved);
    }
  }, [topicId, topic]);

  if (!topic || !category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>找不到文章內容</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.goBack}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveOffline = async () => {
    if (offlineSaved) {
      await removeOfflineArticle(topicId);
      setOfflineSaved(false);
    } else {
      await saveOfflineArticle(topic);
      setOfflineSaved(true);
      Alert.alert('已儲存', '文章已儲存為離線閱讀');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* 標題區 */}
        <View style={styles.titleArea}>
          <View style={[styles.breadcrumb, { backgroundColor: category.color + '10' }]}>
            <Text style={[styles.breadcrumbText, { color: category.color }]}>
              {category.icon} {category.title}
            </Text>
          </View>
          <Text style={styles.title}>{topic.icon} {topic.title}</Text>
          <Text style={styles.description}>{topic.description}</Text>
        </View>

        {/* 行動按鈕 */}
        <View style={styles.actionRow}>
          <BookmarkButton topicId={topicId} size={24} />
          <TouchableOpacity
            style={[styles.offlineButton, offlineSaved && styles.offlineButtonActive]}
            onPress={handleSaveOffline}
          >
            <Text style={styles.offlineIcon}>{offlineSaved ? '📥' : '📂'}</Text>
            <Text style={[styles.offlineText, offlineSaved && styles.offlineTextActive]}>
              {offlineSaved ? '已儲存' : '離線閱讀'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 折疊式內容 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {topic.sections.map((section) => (
          <CollapsibleSection key={section.id} section={section} depth={0} />
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  backArrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  titleArea: {
    marginBottom: Spacing.md,
  },
  breadcrumb: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  breadcrumbText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  offlineButtonActive: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primaryPale,
  },
  offlineIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  offlineText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  offlineTextActive: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  goBack: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
