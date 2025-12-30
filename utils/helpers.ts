/**
 * Utility functions to avoid code duplication
 */

/**
 * Generate a random ID string
 * Extracted to avoid duplication of Math.random().toString(36).substr(2, 9)
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
