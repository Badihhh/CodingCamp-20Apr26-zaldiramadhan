// QuickLink Data Model and Validation Functions

/**
 * QuickLink data structure
 * @typedef {Object} QuickLink
 * @property {string} id - Unique identifier (timestamp-based)
 * @property {string} url - Full URL including protocol
 * @property {string} label - Display text (max 50 characters)
 */

/**
 * Validates a URL and label for a QuickLink
 * @param {string} url - The URL to validate
 * @param {string} label - The label to validate
 * @returns {boolean} True if both URL and label are non-empty after trimming
 */
function validateLink(url, label) {
  const trimmedUrl = url.trim();
  const trimmedLabel = label.trim();

  // Both must be non-empty after trimming
  if (trimmedUrl.length === 0 || trimmedLabel.length === 0) {
    return false;
  }

  // Label must not exceed 50 characters
  if (trimmedLabel.length > 50) {
    return false;
  }

  return true;
}

/**
 * Normalizes a URL by adding protocol if missing
 * @param {string} url - The URL to normalize
 * @returns {string|null} The normalized URL with protocol, or null if URL is empty/whitespace
 */
function normalizeURL(url) {
  const trimmed = url.trim();

  // Return null for empty or whitespace-only URLs
  if (trimmed.length === 0) {
    return null;
  }

  // Check if URL already has a protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Add https:// prefix if missing
  return "https://" + trimmed;
}

/**
 * Generates a unique ID for a QuickLink using timestamp
 * @returns {string} A unique identifier based on current timestamp
 */
function generateLinkId() {
  return Date.now().toString();
}

/**
 * Creates a new QuickLink object
 * @param {string} url - The URL (will be normalized)
 * @param {string} label - The display label
 * @returns {QuickLink|null} A new QuickLink object, or null if validation fails
 */
function createQuickLink(url, label) {
  // Validate inputs
  if (!validateLink(url, label)) {
    return null;
  }

  // Normalize URL
  const normalizedUrl = normalizeURL(url);
  if (!normalizedUrl) {
    return null;
  }

  // Create and return QuickLink object
  return {
    id: generateLinkId(),
    url: normalizedUrl,
    label: label.trim(),
  };
}
