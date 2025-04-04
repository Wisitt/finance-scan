/**
 * Application route definitions
 */
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  SCAN: '/scan',
  ERROR: '/error',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP:'help'
} as const;

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTES = [
  APP_ROUTES.DASHBOARD,
  APP_ROUTES.TRANSACTIONS,
  APP_ROUTES.SCAN,
  APP_ROUTES.PROFILE,
  APP_ROUTES.SETTINGS,
];

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  APP_ROUTES.HOME,
  APP_ROUTES.LOGIN,
  APP_ROUTES.ERROR,
];

/**
 * Routes that don't use the main layout (no sidebar/header)
 */
export const NO_LAYOUT_ROUTES = [
  APP_ROUTES.HOME,
  APP_ROUTES.LOGIN,
  APP_ROUTES.ERROR,
]; 