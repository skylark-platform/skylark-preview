import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
} from "./interfaces";
import { convertModifiersToRules } from "./lib/converters";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getModifiersFromStorage,
  setExtensionEnabledToStorage,
  setModifiersToStorage,
} from "./lib/storage";
import { compareArrays } from "./lib/utils";

const getActiveRules = () => chrome.declarativeNetRequest.getDynamicRules();

const updateActiveRulesIfEnabled = async (
  modifiers: ExtensionMessageValueHeaders
) => {
  const isEnabled = await getExtensionEnabledFromStorage();
  if (!isEnabled) {
    console.log(
      "[updateActiveRulesIfEnabled] update requested when not enabled"
    );
    return [];
  }

  const { uri, apiKey } = await getCredentialsFromStorage();

  const rules = convertModifiersToRules({ ...modifiers, uri, apiKey }) || [];

  const activeRules = await getActiveRules();
  const rulesAreSame = compareArrays(rules, activeRules);
  if (rulesAreSame) {
    console.log(
      "[updateActiveRulesIfEnabled] update requested when no changes in rules exist",
      { activeRules, newRules: rules }
    );
    return [];
  }

  console.log("[updateActiveRulesIfEnabled] rules:", {
    newRules: rules,
    oldRules: activeRules,
  });

  const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
    removeRuleIds: activeRules.map((rule) => rule.id), // remove existing rules
    addRules: rules,
  };

  try {
    await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);
  } catch (err) {
    console.error("[updateActiveRulesIfEnabled] error updating rules", {
      updateRuleOptions,
    });
  }

  await setModifiersToStorage(modifiers);

  console.log("[updateActiveRulesIfEnabled] update successful");

  return rules;
};

const reloadCurrentTab = chrome.tabs.reload;

const enableExtension = async () => {
  await setExtensionEnabledToStorage(true);
  const modifiers = await getModifiersFromStorage();
  const rules = await updateActiveRulesIfEnabled(modifiers);

  await chrome.action.setIcon({
    path: "icons/logo-32x32.png",
  });

  return rules;
};

const disableExtension = async () => {
  await setExtensionEnabledToStorage(false);
  const activeRules = await getActiveRules();

  const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
    removeRuleIds: activeRules.map((rule) => rule.id),
    addRules: [],
  };

  await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);

  await chrome.action.setIcon({
    path: "icons/logo-grayscale-32x32.png",
  });

  const rules = await getActiveRules();

  return rules;
};

const handleMessage = async (
  message: ExtensionMessage,
  sendResponse: (message?: chrome.declarativeNetRequest.Rule[]) => void
) => {
  switch (message.type) {
    case ExtensionMessageType.UpdateHeaders:
      return sendResponse(await updateActiveRulesIfEnabled(message.value));
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

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _, sendResponse) => {
    void handleMessage(message, sendResponse);
    return true;
  }
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
