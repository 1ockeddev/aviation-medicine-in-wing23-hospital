/**
 * Design System Color Constants for User-Side Interface
 * 
 * These colors are specifically designed for the public-facing (user-side)
 * interface to create a cohesive and professional appearance.
 */

export const USER_COLORS = {
  // Primary colors
  navyBlue: '#232e49',       // Primary headers, category names
  darkSlateBlue: '#112632',  // Body text, medication names
  iceBlue: '#ddebf4',        // Primary background
  softGray: '#d1e4f0',       // Alternate background
  mediumBlue: '#61a4ca',     // Primary buttons, icons, accents
  
  // Gradient colors for hover states and highlights
  softBlueGradient: {
    light: '#99c4dd',        // Hover state light
    medium: '#8fbed9',       // Hover state medium
    lighter: '#bdd9e9',      // Hover state lighter variant
  },
} as const;

/**
 * Status colors for medication availability
 */
export const STATUS_COLORS = {
  available: '#22c55e',      // Green for available (Y)
  unavailable: '#ef4444',    // Red for unavailable (N)
  notSpecified: '#6b7280',   // Gray for not specified (NA)
} as const;
