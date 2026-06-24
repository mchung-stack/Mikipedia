// Mikipedia 類型定義

export interface ContentSection {
  id: string;
  title: string;
  content?: string;
  subsections?: ContentSection[];
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  sections: ContentSection[];
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: Topic[];
}

export interface BookmarkItem {
  topicId: string;
  savedAt: number;
}

export interface OfflineArticle {
  topicId: string;
  topic: Topic;
  savedAt: number;
}
