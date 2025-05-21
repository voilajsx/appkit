import { useState, useEffect } from "react";

/**
 * Hook to generate table of contents from document content
 * Extracts headings from markdown content and returns a structured array
 *
 * @param {string} content - Markdown content
 * @returns {Array<{id: string, text: string, level: number}>} List of headings
 */
function useTableOfContents(content) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    // Extract headings from markdown content
    // Look for heading patterns: # Heading 1, ## Heading 2, etc.
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const extractedHeadings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length; // Number of # characters
      const text = match[2].trim();

      // Skip h1 headings (title) since they're usually the page title
      if (level === 1) continue;

      // Generate an ID from the heading text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

      extractedHeadings.push({
        id,
        text,
        level,
      });
    }

    setHeadings(extractedHeadings);
  }, [content]);

  return headings;
}

export default useTableOfContents;
