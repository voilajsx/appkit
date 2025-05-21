/**
 * Utilities for processing markdown content
 * Includes frontmatter extraction and content processing
 */

/**
 * Process markdown content to extract frontmatter and body
 * Returns the processed content ready for rendering
 *
 * @param {string} content - Raw markdown content
 * @returns {string} Processed markdown content
 */
export function processMarkdown(content) {
  if (!content) return "";

  // Remove frontmatter
  const processedContent = content.replace(/^---\n([\s\S]*?)\n---\n/, "");

  // Add IDs to headings for linkability
  return addIdsToHeadings(processedContent);
}

/**
 * Extract metadata from markdown frontmatter
 *
 * @param {string} content - Raw markdown content
 * @returns {Object} Extracted metadata
 */
export function extractMetadata(content) {
  if (!content) return {};

  // Check if content has frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const metadata = {};

  // Parse each line of frontmatter
  frontmatter.split("\n").forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Process value - handle numbers, booleans, arrays
      let processedValue = value.trim();

      // Handle numbers
      if (/^\d+$/.test(processedValue)) {
        processedValue = parseInt(processedValue, 10);
      } else if (/^\d+\.\d+$/.test(processedValue)) {
        processedValue = parseFloat(processedValue);
      }
      // Handle booleans
      else if (processedValue === "true") {
        processedValue = true;
      } else if (processedValue === "false") {
        processedValue = false;
      }
      // Handle arrays (comma-separated values)
      else if (processedValue.startsWith("[") && processedValue.endsWith("]")) {
        processedValue = processedValue
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim());
      }

      metadata[key.trim()] = processedValue;
    }
  });

  return metadata;
}

/**
 * Add IDs to headings for linking and table of contents
 *
 * @param {string} content - Markdown content
 * @returns {string} Content with IDs added to headings
 */
function addIdsToHeadings(content) {
  // We don't actually modify the markdown here - we'll let the Markdown component
  // handle this with rehype-slug. This function is a placeholder for any
  // additional processing we might want to do in the future.
  return content;
}

/**
 * Format a date string from metadata
 *
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "March 15, 2023")
 */
export function formatDate(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
}

/**
 * Calculate reading time for content
 *
 * @param {string} content - Markdown content
 * @returns {number} Estimated reading time in minutes
 */
export function calculateReadingTime(content) {
  if (!content) return 0;

  // Remove code blocks for more accurate word count
  const textContent = content.replace(/```[\s\S]*?```/g, "");

  // Count words (approximate)
  const words = textContent.trim().split(/\s+/).length;

  // Average reading speed: 200-250 words per minute
  // We'll use 225 words per minute
  const readingTime = Math.ceil(words / 225);

  // Return at least 1 minute
  return Math.max(1, readingTime);
}

/**
 * Generate excerpt from content
 *
 * @param {string} content - Markdown content
 * @param {number} [length=160] - Maximum length of excerpt
 * @returns {string} Short excerpt for previews
 */
export function generateExcerpt(content, length = 160) {
  if (!content) return "";

  // Remove frontmatter if present
  const processedContent = content.replace(/^---\n[\s\S]*?\n---\n/, "");

  // Remove headings, code blocks, and links
  const plaintext = processedContent
    .replace(/#+\s+.+/g, "") // Remove headings
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with just their text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold formatting
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic formatting
    .replace(/\n\s*\n/g, "\n"); // Collapse multiple newlines

  // Extract the first few sentences
  const trimmed = plaintext.trim().substring(0, length).trim();

  // Add ellipsis if we truncated the content
  return trimmed.length < plaintext.trim().length ? `${trimmed}...` : trimmed;
}
