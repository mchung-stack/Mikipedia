import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import SearchBar from '../components/SearchBar';
import { allCategories } from '../data';
import { searchTopics } from '../utils/search';
import { Topic, Category } from '../types';

type RootStackParamList = {
  Home: undefined;
  Category: { category: Category };
  Topic: { categoryId: string; topicId: string };
  Search: undefined;
  Bookmarks: undefined;
  Offline: undefined;
};

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchTopics(allCategories, query), [query]);

  const handleResultPress = (topic: Topic, category: Category) => {
    navigation.navigate('Topic', { categoryId: category.id, topicId: topic.id });
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
        <SearchBar value={query} onChangeText={setQuery} autoFocus placeholder="輸入關鍵字搜索..." />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>搜索知識</Text>
            <Text style={styles.emptySubtitle}>
              輸入關鍵字，搜索所有主題的內容
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>沒有找到相關結果</Text>
            <Text style={styles.emptySubtitle}>
              試試使用不同的關鍵字
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              找到 {results.length} 個相關主題
            </Text>
            {results.map(({ topic, category }) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.resultItem}
                onPress={() => handleResultPress(topic, category)}
                activeOpacity={0.7}
              >
                <View style={styles.resultLeft}>
                  <Text style={styles.resultIcon}>{topic.icon}</Text>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle}>{topic.title}</Text>
                    <View style={[styles.categoryTag, { backgroundColor: category.color + '15' }]}>
                      <Text style={[styles.categoryTagText, { color: category.color }]}>
                        {category.title}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
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
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: Colors.primaryPale,
    fontWeight: '300',
  },
});
