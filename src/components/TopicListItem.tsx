import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { Topic } from '../types';

interface TopicListItemProps {
  topic: Topic;
  onPress: (topic: Topic) => void;
}

export default function TopicListItem({ topic, onPress }: TopicListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(topic)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{topic.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{topic.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {topic.description}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    color: Colors.primaryPale,
    fontWeight: '300',
    marginLeft: Spacing.sm,
  },
});
