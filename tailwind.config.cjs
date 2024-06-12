/** @type {import('tailwindcss').Config} */
/**
 * Uses PX as the Tailwind CSS default is REM which causes issues in the content_script.
 * This is because the original web page's font-size overrides the Tailwind default of 16px causing sizing issues.
 * So its safer on this small project to use PX (EM might have been better but I found PX conversions first)
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const formPlugin = require("@tailwindcss/forms");

export default {
  important: true,
  darkMode: "selector",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      zIndex: {
        "above-all": 9999999999,
      },
      fontFamily: {
        heading: "Work Sans",
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "nav-bar": "#F0F2F6",
        black: "#0E1825",
        "brand-primary": "#226DFF",
        success: "#33BD6E",
        "success-content": "#FFF",
        warning: "#FBBD23",
        error: "#F43636",
        "error-content": "#FFF",
        manatee: {
          50: "#F6F8FB",
          100: "#F1F3F7",
          200: "#E6E9EF",
          300: "#BFC5CF",
          400: "#A8AFBD",
          500: "#8D96A7",
          600: "#6B7587",
          700: "#4E5868",
          800: "#2F3948",
          900: "#0E1825",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },
      columns: {
        auto: "auto",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        10: "10",
        11: "11",
        12: "12",
        "3xs": "256px",
        "2xs": "288px",
        xs: "320px",
        sm: "384px",
        md: "448px",
        lg: "512px",
        xl: "576px",
        "2xl": "672px",
        "3xl": "768px",
        "4xl": "896px",
        "5xl": "1024px",
        "6xl": "1152px",
        "7xl": "1280px",
      },
      fontSize: {
        xxs: ["8px", { lineHeight: "12px" }],
        xs: ["10px", { lineHeight: "14px" }],
        sm: ["12px", { lineHeight: "16px" }],
        base: ["14px", { lineHeight: "20px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["20px", { lineHeight: "28px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["30px", { lineHeight: "36px" }],
        "5xl": ["36px", { lineHeight: "36px" }],
        "6xl": ["48px", { lineHeight: "1" }],
        "7xl": ["60px", { lineHeight: "1" }],
        "8xl": ["72px", { lineHeight: "1" }],
        "9xl": ["96px", { lineHeight: "1" }],
      },
      lineHeight: {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
      },
      maxWidth: ({ theme, breakpoints }) => ({
        none: "none",
        0: "0px",
        xs: "320px",
        sm: "384px",
        md: "448px",
        lg: "512px",
        xl: "576px",
        "2xl": "672px",
        "3xl": "768px",
        "4xl": "896px",
        "5xl": "1024px",
        "6xl": "1152px",
        "7xl": "1280px",
        full: "100%",
        min: "min-content",
        max: "max-content",
        fit: "fit-content",
        prose: "65ch",
        ...breakpoints(theme("screens")),
      }),
      spacing: {
        px: "1px",
        0: "0",
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        14: "56px",
        16: "64px",
        20: "80px",
        24: "96px",
        28: "112px",
        32: "128px",
        36: "144px",
        40: "160px",
        44: "176px",
        48: "192px",
        52: "208px",
        56: "224px",
        60: "240px",
        64: "256px",
        72: "288px",
        80: "320px",
        96: "384px",
      },
    },
  },
  plugins: [formPlugin],
};
