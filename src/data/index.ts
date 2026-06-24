import { Category } from '../types';
import { historyCategory } from './history';
import { cultureCategory } from './culture';
import { philosophyCategory } from './philosophy';
import { scienceCategory } from './science';
import { industryCategory } from './industry';
import { countriesCategory } from './countries';
import { lifestyleCategory } from './lifestyle';

export const allCategories: Category[] = [
  historyCategory,
  cultureCategory,
  philosophyCategory,
  scienceCategory,
  industryCategory,
  countriesCategory,
  lifestyleCategory,
];

export function getCategoryById(id: string): Category | undefined {
  return allCategories.find((c) => c.id === id);
}

export function getTopicById(categoryId: string, topicId: string) {
  const category = getCategoryById(categoryId);
  return category?.topics.find((t) => t.id === topicId);
}
