import { ManifestV3Export, defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

/** Start - Copied from @crxjs/vite-plugin */
interface ChromeManifestBackground {
  service_worker: string;
  type?: "module";
}
interface FirefoxManifestBackground {
  scripts: string[];
  persistent?: false;
}
/** End - Copied from @crxjs/vite-plugin */

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export const getBrowserFromEnv = (): "chrome" | "firefox" => {
  const browser = process.env.BROWSER;
  if (!browser) {
    return "chrome";
  }

  if (browser !== "chrome" && browser !== "firefox") {
    throw new Error("Invalid browser given");
  }
  return browser;
};

const getBrowserSpecificProperties = (
  browser: "chrome" | "firefox",
  version: string,
): Partial<ManifestV3Export> => {
  const commonPermissions = ["storage", "declarativeNetRequest"];

  if (browser === "firefox") {
    const firefoxBackground: FirefoxManifestBackground = {
      scripts: ["src/background.ts"],
    };
    return {
      background: firefoxBackground,
      permissions: commonPermissions,
      browser_specific_settings: {
        gecko: {
          id: "skylark-preview_support@skylarkplatform.com",
        },
      },
    };
  }

  const chromeBackground: ChromeManifestBackground = {
    service_worker: "src/background.ts",
    type: "module",
  };
  return {
    background: chromeBackground,
    permissions: [...commonPermissions, "background"],
    // semver is OK in "version_name"
    version_name: version,
  };
};

export default defineManifest(({ mode }) => {
  const appName = "Skylark Preview";

  let name = appName;
  if (mode !== "production") {
    name = mode === "staging" ? `${name} [STAGING]` : `${name} [DEVELOPMENT]`;
  }

  const browser = getBrowserFromEnv();

  const manifest: ManifestV3Export = {
    manifest_version: 3,
    name,
    description: packageJson.description,
    // up to four numbers separated by dots
    version: `${major}.${minor}.${patch}`,
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
    content_scripts: [
      {
        js: ["src/content.tsx"],
        matches: ["http://*/*", "https://*/*"],
      },
    ],
    host_permissions: ["http://*/*", "https://*/*"],
    ...getBrowserSpecificProperties(browser, version),
  };

  return manifest;
});
