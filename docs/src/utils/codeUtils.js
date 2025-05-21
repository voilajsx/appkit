/**
 * Utilities for code syntax highlighting and code block handling
 */

/**
 * Get the correct language identifier for syntax highlighting
 *
 * @param {string} language - Language identifier from code block
 * @returns {string} Normalized language identifier
 */
export function normalizeLanguage(language) {
  if (!language) return "text";

  // Map common aliases to standard language identifiers
  const languageMap = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    html: "html",
    css: "css",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    bash: "bash",
    sh: "bash",
    shell: "bash",
    python: "python",
    py: "python",
    ruby: "ruby",
    rb: "ruby",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rust: "rust",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    sql: "sql",
    graphql: "graphql",
    gql: "graphql",
    dockerfile: "docker",
    docker: "docker",
  };

  return languageMap[language.toLowerCase()] || language.toLowerCase();
}

/**
 * Get user-friendly language display name
 *
 * @param {string} language - Language identifier
 * @returns {string} Display name for the language
 */
export function getLanguageDisplayName(language) {
  if (!language) return "Plain Text";

  const normalizedLanguage = normalizeLanguage(language);

  const displayNames = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    jsx: "React JSX",
    tsx: "React TSX",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    yaml: "YAML",
    markdown: "Markdown",
    bash: "Terminal",
    python: "Python",
    ruby: "Ruby",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    graphql: "GraphQL",
    docker: "Dockerfile",
    text: "Plain Text",
  };

  return (
    displayNames[normalizedLanguage] ||
    normalizedLanguage.charAt(0).toUpperCase() + normalizedLanguage.slice(1)
  );
}

/**
 * Escape HTML entities in code
 *
 * @param {string} code - Code to escape
 * @returns {string} Escaped code
 */
export function escapeHtml(code) {
  if (!code) return "";

  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Parse query parameters from code block info string
 * For example: ```js{1,3-5} file=example.js
 *
 * @param {string} infoString - Language info string from code block
 * @returns {Object} Object containing language and parameters
 */
export function parseCodeBlockParams(infoString) {
  if (!infoString) return { language: "text", params: {} };

  // Extract language and params string
  const match = infoString.match(/^([^\s{]+)(?:{([^}]+)})?(?:\s+(.*))?$/);

  if (!match) return { language: "text", params: {} };

  const [, language, highlightString, restParams] = match;
  const params = {};

  // Parse line highlighting
  if (highlightString) {
    params.highlight = parseHighlightLines(highlightString);
  }

  // Parse additional parameters (key=value)
  if (restParams) {
    restParams.split(/\s+/).forEach((param) => {
      const [key, value] = param.split("=");
      if (key && value) {
        params[key] = value;
      }
    });
  }

  return {
    language: normalizeLanguage(language),
    params,
  };
}

/**
 * Parse line highlighting notation (e.g., "1,3-5,7")
 *
 * @param {string} highlightString - Highlight notation
 * @returns {Array<number|Array<number>>} Highlighted line numbers
 */
function parseHighlightLines(highlightString) {
  if (!highlightString) return [];

  return highlightString.split(",").map((part) => {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      return [start, end];
    }
    return Number(part);
  });
}

/**
 * Check if a line should be highlighted
 *
 * @param {number} lineNumber - Line number (1-based)
 * @param {Array<number|Array<number>>} highlightLines - Highlighted line numbers
 * @returns {boolean} Whether the line should be highlighted
 */
export function shouldHighlightLine(lineNumber, highlightLines) {
  if (!highlightLines || !highlightLines.length) return false;

  return highlightLines.some((highlight) => {
    if (Array.isArray(highlight)) {
      const [start, end] = highlight;
      return lineNumber >= start && lineNumber <= end;
    }
    return lineNumber === highlight;
  });
}

/**
 * Format code by removing common indentation
 *
 * @param {string} code - Raw code
 * @returns {string} Formatted code
 */
export function formatCode(code) {
  if (!code) return "";

  // Split into lines
  const lines = code.split("\n");

  // Find minimum indentation (skip empty lines)
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)[0].length);

  const minIndent = Math.min(...indents);

  // Remove common indentation
  return lines
    .map((line) => line.slice(minIndent))
    .join("\n")
    .trim();
}
