import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { ContentSection } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  section: ContentSection;
  depth?: number;
}

const INDENT_PER_LEVEL = 20;
const MAX_DEPTH = 5; // 最多支援5層嵌套（包含主題層）

export default function CollapsibleSection({ section, depth = 0 }: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(depth <= 1);
  const rotateAnim = useRef(new Animated.Value(depth <= 1 ? 1 : 0)).current;

  const hasSubsections = section.subsections && section.subsections.length > 0;
  const currentDepth = Math.min(depth, MAX_DEPTH);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotateAnim]);

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // 根據深度調整樣式
  const depthColors = [
    {}, // depth 0 - default
    { backgroundColor: Colors.surface }, // depth 1
    { backgroundColor: Colors.surfaceAlt }, // depth 2
    { backgroundColor: Colors.background }, // depth 3
    { backgroundColor: Colors.backgroundLight }, // depth 4
    { backgroundColor: Colors.surfaceAlt }, // depth 5
  ];

  const borderColors = [
    Colors.primary, // depth 0 - primary purple
    Colors.primaryLight, // depth 1
    Colors.primaryPale, // depth 2
    Colors.borderLight, // depth 3
    Colors.borderLight, // depth 4
    Colors.border, // depth 5
  ];

  const depthStyle = depthColors[Math.min(currentDepth, 5)];

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <TouchableOpacity
        style={[
          styles.header,
          depthStyle,
          { paddingLeft: Spacing.lg + currentDepth * INDENT_PER_LEVEL },
          currentDepth > 0 && { borderLeftWidth: 3, borderLeftColor: borderColors[Math.min(currentDepth, 5)] },
        ]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {hasSubsections && (
            <Animated.View
              style={[styles.arrowContainer, { transform: [{ rotate: arrowRotation }] }]}
            >
              <Text style={styles.arrow}>▶</Text>
            </Animated.View>
          )}
          {!hasSubsections && <View style={styles.dotContainer}><View style={styles.dot} /></View>}
          <Text
            style={[
              styles.title,
              currentDepth === 0 && styles.titleDepth0,
              currentDepth === 1 && styles.titleDepth1,
              currentDepth === 2 && styles.titleDepth2,
              currentDepth >= 3 && styles.titleDepth3,
            ]}
            numberOfLines={2}
          >
            {section.title}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 展開內容 */}
      {expanded && (
        <View style={styles.content}>
          {/* 文字內容 */}
          {section.content && (
            <Text
              style={[
                styles.textContent,
                { paddingLeft: Spacing.lg + (currentDepth + 1) * INDENT_PER_LEVEL },
              ]}
            >
              {section.content}
            </Text>
          )}

          {/* 子區段（遞迴渲染） */}
          {hasSubsections &&
            section.subsections!.map((subsection) => (
              <CollapsibleSection
                key={subsection.id}
                section={subsection}
                depth={currentDepth + 1}
              />
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  arrow: {
    fontSize: 10,
    color: Colors.primary,
  },
  dotContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryPale,
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
  },
  titleDepth0: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  titleDepth1: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  titleDepth2: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  titleDepth3: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  content: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  textContent: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textSecondary,
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
