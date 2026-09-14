import { useTheme } from '../context/ThemeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-dark-300' : 'text-gray-600',
      muted: isDark ? 'text-dark-400' : 'text-gray-500',
      faint: isDark ? 'text-dark-500' : 'text-gray-400',
    },
    bg: {
      page: isDark ? 'bg-dark-950' : 'bg-gray-50',
      card: isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white border-gray-200',
      input: isDark ? 'bg-dark-800 border-dark-700' : 'bg-gray-50 border-gray-200',
      hover: isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50',
      row: isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50',
      badge: isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-100 text-gray-600',
      pagination: isDark ? 'bg-dark-800 hover:bg-dark-700 text-dark-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    },
    border: {
      default: isDark ? 'border-dark-700/50' : 'border-gray-200',
      row: isDark ? 'border-dark-800/50' : 'border-gray-100',
    },
  };
};
