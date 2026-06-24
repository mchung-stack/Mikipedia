import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkItem, OfflineArticle, Topic } from '../types';

const BOOKMARKS_KEY = '@mikipedia_bookmarks';
const OFFLINE_KEY = '@mikipedia_offline';

// 收藏功能
export async function getBookmarks(): Promise<BookmarkItem[]> {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isBookmarked(topicId: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some((b) => b.topicId === topicId);
}

export async function toggleBookmark(topicId: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  const index = bookmarks.findIndex((b) => b.topicId === topicId);
  if (index >= 0) {
    bookmarks.splice(index, 1);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false;
  }
  bookmarks.push({ topicId, savedAt: Date.now() });
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return true;
}

// 離線文章功能
export async function getOfflineArticles(): Promise<OfflineArticle[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isOfflineCached(topicId: string): Promise<boolean> {
  const articles = await getOfflineArticles();
  return articles.some((a) => a.topicId === topicId);
}

export async function saveOfflineArticle(topic: Topic): Promise<void> {
  const articles = await getOfflineArticles();
  const index = articles.findIndex((a) => a.topicId === topic.id);
  if (index >= 0) {
    articles[index] = { topicId: topic.id, topic, savedAt: Date.now() };
  } else {
    articles.push({ topicId: topic.id, topic, savedAt: Date.now() });
  }
  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(articles));
}

export async function removeOfflineArticle(topicId: string): Promise<void> {
  const articles = await getOfflineArticles();
  const filtered = articles.filter((a) => a.topicId !== topicId);
  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
}
