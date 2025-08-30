/**
 * Image utility functions for handling product images with proper fallbacks
 */

// Default placeholder image URI (you can replace with an actual placeholder image)
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/300x300.png?text=No+Image';

/**
 * Gets a valid image URI from a product's images array
 * Returns a placeholder if no valid image is found
 */
export const getValidImageUri = (images?: string[], index: number = 0): string => {
  // Check if images array exists and has items
  if (!images || !Array.isArray(images) || images.length === 0) {
    return DEFAULT_PLACEHOLDER;
  }

  // Get the image at specified index
  const imageUri = images[index];

  // Check if the URI is valid (not null, undefined, or empty string)
  if (!imageUri || imageUri.trim() === '') {
    return DEFAULT_PLACEHOLDER;
  }

  return imageUri.trim();
};

/**
 * Gets the first valid image URI from a product's images array
 */
export const getFirstValidImage = (images?: string[]): string => {
  return getValidImageUri(images, 0);
};

/**
 * Gets all valid image URIs from a product's images array
 * Filters out empty/invalid URIs and adds placeholder if no valid images found
 */
export const getValidImages = (images?: string[]): string[] => {
  if (!images || !Array.isArray(images)) {
    return [DEFAULT_PLACEHOLDER];
  }

  // Filter out empty/invalid URIs
  const validImages = images.filter(uri => uri && uri.trim() !== '');

  // Return placeholder if no valid images found
  if (validImages.length === 0) {
    return [DEFAULT_PLACEHOLDER];
  }

  return validImages;
};

/**
 * Checks if a URI is valid (not empty or whitespace)
 */
export const isValidImageUri = (uri?: string): boolean => {
  return Boolean(uri && uri.trim() !== '');
};