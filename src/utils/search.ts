import { Topic, Category } from '../types';

// 搜索工具 - 在所有主題中搜索關鍵字
export function searchTopics(
  categories: Category[],
  query: string,
): { topic: Topic; category: Category }[] {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  const results: { topic: Topic; category: Category }[] = [];

  for (const category of categories) {
    for (const topic of category.topics) {
      if (
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.description.toLowerCase().includes(lowerQuery) ||
        searchInSections(topic.sections, lowerQuery)
      ) {
        results.push({ topic, category });
      }
    }
  }
  return results;
}

function searchInSections(
  sections: { title: string; content?: string; subsections?: any[] }[],
  query: string,
): boolean {
  for (const section of sections) {
    if (
      section.title.toLowerCase().includes(query) ||
      (section.content && section.content.toLowerCase().includes(query))
    ) {
      return true;
    }
    if (section.subsections && searchInSections(section.subsections, query)) {
      return true;
    }
  }
  return false;
}
