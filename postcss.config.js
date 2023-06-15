export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-parent-selector": {
      selector: "#skylark-preview-extension", // Ensure that we don't let our Tailwind CSS styles affect the rest of the page
    },
  },
};
