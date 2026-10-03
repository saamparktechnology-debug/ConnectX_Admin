export const COLORS = {
  primary: '#FF6B35',
  primaryLight: '#FF8F65',
  primaryDark: '#E55A2B',
  accent: '#FFD166',
  accentLight: '#FFE099',
  background: '#FFF0EB',
  backgroundDark: '#FFE5DD',
  card: '#FFFFFF',
  cardDark: '#FFF8F5',
  dark: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#1A1D21',
    950: '#0D0F12',
  },
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFB300',
  error: '#DC3545',
  white: '#FFFFFF',
  textPrimary: '#1A1D21',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  border: '#E9ECEF',
  borderLight: '#F1F3F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  pink: '#FFE5E5',
  pinkDark: '#FFCCCC',
  gradient: {
    banner: ['#667EEA', '#764BA2'],
    call: ['#2196F3', '#1565C0'],
    premium: ['#FFD166', '#FF6B35'],
  },
  blue: '#2196F3',
  blueDark: '#1565C0',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.130:5000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.31.130:5000';
