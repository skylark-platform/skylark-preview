import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
  ExtensionSettings,
} from "./interfaces";
import { convertModifiersToRules } from "./lib/converters";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getExtensionSettingsFromStorage,
  getModifiersFromStorage,
  setExtensionEnabledToStorage,
  setExtensionSettingsToStorage,
  setModifiersToStorage,
} from "./lib/storage";
import { compareArrays } from "./lib/utils";

const emitMessageToAllTabs = async (message: ExtensionMessage) => {
  // chrome.tabs.query({}, function (tabs) {
  //   tabs.map((tab) => {
  //     if (tab.id) {
  //       chrome.tabs.sendMessage(tab.id, message);
  //     }
  //   });
  // });

  const tabs = await browser.tabs.query({});
  tabs.map((tab) => {
    if (tab.id) {
      browser.tabs.sendMessage(tab.id, message);
    }
  });
};

const getActiveRules = () => browser.declarativeNetRequest.getDynamicRules();

const updateActiveRulesIfEnabled = async (
  modifiers: ExtensionMessageValueHeaders,
) => {
  const isEnabled = await getExtensionEnabledFromStorage();
  if (!isEnabled) {
    console.log(
      "[updateActiveRulesIfEnabled] update requested when not enabled",
    );
    return [];
  }

  const { uri, apiKey } = await getCredentialsFromStorage();

  const settings = await getExtensionSettingsFromStorage();

  const rules =
    convertModifiersToRules({
      ...modifiers,
      uri,
      apiKey,
      settings,
    }) || [];

  const activeRules = await getActiveRules();
  const rulesAreSame = compareArrays(rules, activeRules);
  if (rulesAreSame) {
    console.log(
      "[updateActiveRulesIfEnabled] update requested when no changes in rules exist",
      { activeRules, newRules: rules },
    );
    return [];
  }

  console.log("[updateActiveRulesIfEnabled] rules:", {
    newRules: rules,
    oldRules: activeRules,
  });

  const updateRuleOptions: browser.declarativeNetRequest._UpdateDynamicRulesOptions =
    {
      removeRuleIds: activeRules.map((rule) => rule.id), // remove existing rules
      addRules: rules as browser.declarativeNetRequest.Rule[],
    };

  try {
    await browser.declarativeNetRequest.updateDynamicRules(updateRuleOptions);
  } catch (err) {
    console.error("[updateActiveRulesIfEnabled] error updating rules", {
      updateRuleOptions,
    });
  }

  await setModifiersToStorage(modifiers);
  await setExtensionSettingsToStorage(settings);

  console.log("[updateActiveRulesIfEnabled] update successful");

  return rules;
};

const updateSettings = async (settings: ExtensionSettings) => {
  await setExtensionSettingsToStorage(settings);

  emitMessageToAllTabs({
    type: ExtensionMessageType.UpdateSettings,
    value: settings,
  });

  return undefined;
};

const reloadCurrentTab = browser.tabs.reload;

const enableExtension = async () => {
  await setExtensionEnabledToStorage(true);
  const modifiers = await getModifiersFromStorage();

  const rules = await updateActiveRulesIfEnabled(modifiers);

  await browser.action.setIcon({
    path: "icons/logo-dot-32x32.png",
  });

  emitMessageToAllTabs({
    type: ExtensionMessageType.EnableExtension,
  });

  return rules;
};

const disableExtension = async () => {
  await setExtensionEnabledToStorage(false);
  const activeRules = await getActiveRules();

  const updateRuleOptions: browser.declarativeNetRequest._UpdateDynamicRulesOptions =
    {
      removeRuleIds: activeRules.map((rule) => rule.id),
      addRules: [],
    };

  await browser.declarativeNetRequest.updateDynamicRules(updateRuleOptions);

  await browser.action.setIcon({
    path: "icons/logo-grayscale-32x32.png",
  });

  emitMessageToAllTabs({
    type: ExtensionMessageType.DisableExtension,
  });

  const rules = await getActiveRules();

  return rules;
};

const handleMessage = async (
  message: ExtensionMessage,
  sendResponse: (
    message?:
      | browser.declarativeNetRequest.Rule[]
      | chrome.declarativeNetRequest.Rule[],
  ) => void,
) => {
  switch (message.type) {
    case ExtensionMessageType.UpdateHeaders:
      return sendResponse(await updateActiveRulesIfEnabled(message.value));
    case ExtensionMessageType.UpdateSettings:
      return sendResponse(await updateSettings(message.value));
    case ExtensionMessageType.EnableExtension:
      return sendResponse(await enableExtension());
    case ExtensionMessageType.DisableExtension:
      return sendResponse(await disableExtension());
    case ExtensionMessageType.RefreshTab:
      void reloadCurrentTab();
      return sendResponse();
    case ExtensionMessageType.GetActiveHeaders:
    case ExtensionMessageType.ClearHeaders:
    default:
      return sendResponse();
  }
};

browser.runtime.onMessage.addListener(
  (message: ExtensionMessage, _, sendResponse) => {
    void handleMessage(message, sendResponse);
    return true;
  },
);

const startupChecks = async () => {
  console.log("[startup] Service worker started.");

  const [enabled, credentials] = await Promise.all([
    getExtensionEnabledFromStorage(),
    getCredentialsFromStorage(),
  ]);

  console.log("[startup] Extension enabled:", enabled);
  console.log("[startup] Credentials on startup:", credentials);
  if (enabled && (!credentials.apiKey || !credentials.uri)) {
    // Sometimes the API Key can clear itself as it is part of session storage, we need to handle this by disabling if some credentials are missing
    console.log("[startup] Disabling extension due to credentials missing");
    void disableExtension();
  }
};

void startupChecks();

export {};
