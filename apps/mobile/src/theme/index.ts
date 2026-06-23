export const colors = {
  primary: '#E8611A',
  primaryDark: '#C44E0F',
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  white: '#FFFFFF',
  black: '#000000',
  sosRed: '#DC2626',
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  tiny: { fontSize: 12, fontWeight: '400' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};
