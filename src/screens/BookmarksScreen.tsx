import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { getBookmarks, toggleBookmark } from '../utils/storage';
import { allCategories } from '../data';
import { Topic, Category } from '../types';

type RootStackParamList = {
  Home: undefined;
  Category: { category: Category };
  Topic: { categoryId: string; topicId: string };
  Search: undefined;
  Bookmarks: undefined;
  Offline: undefined;
};

interface BookmarkItem {
  topicId: string;
  savedAt: number;
}

export default function BookmarksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBookmarks().then(setBookmarks);
    }, []),
  );

  const handleRemove = async (topicId: string) => {
    await toggleBookmark(topicId);
    getBookmarks().then(setBookmarks);
  };

  const getTopicInfo = (bookmark: BookmarkItem) => {
    for (const category of allCategories) {
      const topic = category.topics.find((t: Topic) => t.id === bookmark.topicId);
      if (topic) {
        return { topic, category };
      }
    }
    return null;
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
        <Text style={styles.headerTitle}>⭐ 我的收藏</Text>
        <Text style={styles.headerCount}>{bookmarks.length} 個主題</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📑</Text>
            <Text style={styles.emptyTitle}>還沒有收藏</Text>
            <Text style={styles.emptySubtitle}>
              在閱讀文章時點擊星號即可收藏
            </Text>
          </View>
        ) : (
          bookmarks.map((bookmark) => {
            const info = getTopicInfo(bookmark);
            if (!info) return null;
            const { topic, category } = info;
            return (
              <View key={bookmark.topicId} style={styles.bookmarkItem}>
                <TouchableOpacity
                  style={styles.bookmarkContent}
                  onPress={() =>
                    navigation.navigate('Topic', {
                      categoryId: category.id,
                      topicId: topic.id,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <View style={[styles.catTag, { backgroundColor: category.color + '15' }]}>
                      <Text style={[styles.catTagText, { color: category.color }]}>
                        {category.title}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(bookmark.topicId)}
                >
                  <Text style={styles.removeText}>取消收藏</Text>
                </TouchableOpacity>
              </View>
            );
          })
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
  bookmarkItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  bookmarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  catTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  catTagText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
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
