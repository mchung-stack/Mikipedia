import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { isBookmarked, toggleBookmark } from '../utils/storage';
import { Colors } from '../theme/colors';

interface BookmarkButtonProps {
  topicId: string;
  size?: number;
}

export default function BookmarkButton({ topicId, size = 28 }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    isBookmarked(topicId).then(setBookmarked);
  }, [topicId]);

  const handleToggle = useCallback(async () => {
    const newState = await toggleBookmark(topicId);
    setBookmarked(newState);
  }, [topicId]);

  return (
    <TouchableOpacity onPress={handleToggle} style={styles.button} activeOpacity={0.6}>
      <Text style={[styles.icon, { fontSize: size }]}>
        {bookmarked ? '⭐' : '☆'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  icon: {
    color: Colors.warning,
  },
});
