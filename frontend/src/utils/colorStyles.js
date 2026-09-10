// Shared tint palette for dashboard cards (stat cards, quick actions). Light
// mode gets a colored card background + a slightly deeper icon badge so cards
// don't blend into the page; dark mode keeps the existing neutral gray-800
// card with a translucent tinted badge, which already reads well.
export const CARD_TINTS = {
  primary: 'border-primary-100 bg-primary-50 dark:border-gray-700 dark:bg-gray-800',
  blue: 'border-blue-100 bg-blue-50 dark:border-gray-700 dark:bg-gray-800',
  purple: 'border-purple-100 bg-purple-50 dark:border-gray-700 dark:bg-gray-800',
  amber: 'border-amber-100 bg-amber-50 dark:border-gray-700 dark:bg-gray-800',
  red: 'border-red-100 bg-red-50 dark:border-gray-700 dark:bg-gray-800',
  gray: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
};

export const ICON_TINTS = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  gray: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};
