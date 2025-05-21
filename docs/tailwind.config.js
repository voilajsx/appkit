/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // @voilajsx/appkit brand colors
        voila: {
          blue: "#4263eb",
          purple: "#7048e8",
          orange: "#f76707",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "var(--tw-prose-body)",
            a: {
              color: "var(--tw-prose-links)",
              textDecoration: "underline",
              fontWeight: "500",
              "&:hover": {
                color: "var(--color-primary-600)",
              },
            },
            "h1, h2, h3, h4": {
              fontWeight: "700",
              marginTop: "2em",
              marginBottom: "1em",
              lineHeight: "1.1",
            },
            h1: {
              fontSize: "2.25em",
            },
            h2: {
              fontSize: "1.875em",
            },
            h3: {
              fontSize: "1.5em",
            },
            h4: {
              fontSize: "1.25em",
            },
            "ul, ol": {
              paddingLeft: "1.5em",
            },
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
            },
            code: {
              color: "var(--tw-prose-code)",
              backgroundColor: "var(--tw-prose-pre-bg)",
              borderRadius: "0.25rem",
              padding: "0.2em 0.4em",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "var(--tw-prose-pre-bg)",
              borderRadius: "0.5rem",
              padding: "1rem",
              overflowX: "auto",
              "& code": {
                backgroundColor: "transparent",
                padding: "0",
                fontWeight: "inherit",
              },
            },
            blockquote: {
              fontStyle: "italic",
              color: "var(--tw-prose-quotes)",
              borderLeftWidth: "4px",
              borderLeftColor: "var(--tw-prose-quote-borders)",
              paddingLeft: "1em",
            },
            hr: {
              borderColor: "var(--tw-prose-hr)",
              marginTop: "2em",
              marginBottom: "2em",
            },
            table: {
              width: "100%",
              tableLayout: "auto",
              textAlign: "left",
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
            thead: {
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-th-borders)",
            },
            "thead th": {
              fontWeight: "600",
              padding: "0.5em 0.75em",
              verticalAlign: "bottom",
            },
            "tbody td": {
              padding: "0.5em 0.75em",
              verticalAlign: "top",
              borderBottomWidth: "1px",
              borderBottomColor: "var(--tw-prose-td-borders)",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};
