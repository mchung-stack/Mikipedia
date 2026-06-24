import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { getOfflineArticles, removeOfflineArticle } from '../utils/storage';
import { OfflineArticle, Topic, Category } from '../types';

type RootStackParamList = {
  Home: undefined;
  Category: { category: Category };
  Topic: { categoryId: string; topicId: string };
  Search: undefined;
  Bookmarks: undefined;
  Offline: undefined;
};

export default function OfflineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [articles, setArticles] = useState<OfflineArticle[]>([]);

  useFocusEffect(
    useCallback(() => {
      getOfflineArticles().then(setArticles);
    }, []),
  );

  const handleRemove = async (topicId: string) => {
    Alert.alert('確認刪除', '確定要刪除此離線文章？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          await removeOfflineArticle(topicId);
          getOfflineArticles().then(setArticles);
        },
      },
    ]);
  };

  const handleOpen = (article: OfflineArticle) => {
    navigation.navigate('Topic', {
      categoryId: article.topic.category,
      topicId: article.topic.id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📥 離線文章</Text>
        <Text style={styles.headerCount}>{articles.length} 篇文章</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>還沒有離線文章</Text>
            <Text style={styles.emptySubtitle}>
              在閱讀文章時點擊「離線閱讀」按鈕即可儲存
            </Text>
          </View>
        ) : (
          articles.map((article) => (
            <View key={article.topicId} style={styles.articleItem}>
              <TouchableOpacity
                style={styles.articleContent}
                onPress={() => handleOpen(article)}
                activeOpacity={0.7}
              >
                <Text style={styles.articleIcon}>{article.topic.icon}</Text>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle}>{article.topic.title}</Text>
                  <Text style={styles.articleDesc} numberOfLines={1}>
                    {article.topic.description}
                  </Text>
                  <Text style={styles.saveDate}>
                    儲存於 {new Date(article.savedAt).toLocaleDateString('zh-TW')}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(article.topicId)}
              >
                <Text style={styles.removeText}>刪除</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
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
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  articleItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  articleIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  articleDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  saveDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.primaryPale,
    fontWeight: '300',
  },
  removeButton: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  removeText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: '500',
  },
});
