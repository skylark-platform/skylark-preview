import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest(({ mode }) => {
  const appName = "Skylark Preview";

  let name = appName;
  if (mode !== "production") {
    name = mode === "staging" ? `${name} [STAGING]` : `${name} [DEVELOPMENT]`;
  }

  return {
    manifest_version: 3,
    name,
    description: packageJson.description,
    // up to four numbers separated by dots
    version: `${major}.${minor}.${patch}`,
    // semver is OK in "version_name"
    version_name: version,
    icons: {
      "16": "icons/logo-16x16.png",
      "32": "icons/logo-32x32.png",
      "48": "icons/logo-48x48.png",
      "128": "icons/logo-128x128.png",
    },
    action: {
      default_popup: "index.html",
      default_title: name,
    },
    background: {
      service_worker: "src/background.ts",
      type: "module",
    },
    content_scripts: [
      {
        js: ["src/content.tsx"],
        matches: ["http://*/*", "https://*/*"],
      },
    ],
    host_permissions: ["http://*/*", "https://*/*"],
    permissions: ["background", "storage", "declarativeNetRequest"],
  };
});
