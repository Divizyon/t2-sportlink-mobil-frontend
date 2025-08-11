/**
 * SportLink Design System
 * Tutarlı UI/UX için merkezi tasarım token'ları
 */

// ===== SPACING SYSTEM =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

// ===== BORDER RADIUS SYSTEM =====
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
} as const;

// ===== TYPOGRAPHY SYSTEM =====
export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 28,
    xxxxxl: 32,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
} as const;

// ===== SHADOW SYSTEM =====
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ===== OPACITY SYSTEM =====
export const opacity = {
  invisible: 0,
  subtle: 0.05,
  light: 0.1,
  soft: 0.15,
  medium: 0.3,
  strong: 0.6,
  heavy: 0.8,
  opaque: 1,
} as const;

// ===== ICON SIZES =====
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
} as const;

// ===== COMPONENT PRESETS =====
export const componentPresets = {
  // Button presets
  button: {
    sm: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSizes.sm,
    },
    md: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSizes.md,
    },
    lg: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSizes.lg,
    },
  },
  
  // Card presets
  card: {
    sm: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      ...shadows.sm,
    },
    md: {
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
    lg: {
      padding: spacing.xl,
      borderRadius: borderRadius.xl,
      ...shadows.lg,
    },
  },
  
  // Icon container presets
  iconContainer: {
    xs: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    sm: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    md: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    lg: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    xl: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
  },
} as const;

// ===== ANIMATION TIMINGS =====
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ===== LAYOUT GRID =====
export const layout = {
  containerPadding: spacing.xl, // 20px
  sectionGap: spacing.xxxl, // 32px
  itemGap: spacing.md, // 12px
  horizontalScrollPadding: spacing.xl, // 20px
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Theme-aware alpha renk oluşturucu
 */
export const createAlphaColor = (color: string, alpha: number): string => {
  // Hex color'u alpha ile kombine et
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${color}${alphaHex}`;
};

/**
 * Responsive boyut hesaplayıcı
 */
export const responsive = {
  scale: (base: number, factor: number = 1.2): number => Math.round(base * factor),
  clamp: (min: number, value: number, max: number): number => Math.min(Math.max(min, value), max),
};

// ===== TYPE EXPORTS =====
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type TypographyFontSize = keyof typeof typography.fontSizes;
export type TypographyFontWeight = keyof typeof typography.fontWeights;
export type ShadowKey = keyof typeof shadows;
export type OpacityKey = keyof typeof opacity;
export type IconSizeKey = keyof typeof iconSizes;
