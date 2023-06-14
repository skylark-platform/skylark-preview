import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
  SkylarkCredentials,
} from "./interfaces";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getModifiersFromStorage,
  setExtensionEnabledToStorage,
  setModifiersToStorage,
} from "./lib/storage";
import { compareArrays } from "./lib/utils";

const convertModifiersToRules = ({
  dimensions,
  timeTravel,
  uri,
  apiKey,
}: ExtensionMessageValueHeaders & SkylarkCredentials):
  | chrome.declarativeNetRequest.Rule[]
  | undefined => {
  if (!apiKey) {
    return undefined;
  }

  const allResourceTypes = Object.values(
    chrome.declarativeNetRequest.ResourceType
  );

  const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] =
    Object.entries(dimensions)
      .filter(([, value]) => value)
      .map(([dimension, value]) => ({
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        header: `x-sl-dimension-${dimension}`,
        value,
      }));

  if (timeTravel) {
    const timeTravelRule: chrome.declarativeNetRequest.ModifyHeaderInfo = {
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      header: "x-time-travel",
      value: timeTravel,
    };
    requestHeaders.push(timeTravelRule);
  }

  // Always bypass cache
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "x-bypass-cache",
    value: "1",
  });

  // Always disable ignore availability so the dimension headers actually do something
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "x-ignore-availability",
    value: "false",
  });

  // Always overwrite the API key so that the user can supply an admin (for time-travel) one but their app can use a readonly one
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "Authorization",
    value: apiKey,
  });

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders,
      },
      condition: {
        urlFilter: uri,
        resourceTypes: allResourceTypes,
      },
    },
  ];

  return rules;
};

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

  const activeRules = await getActiveRules();

  const { uri, apiKey } = await getCredentialsFromStorage();

  const rules = convertModifiersToRules({ ...modifiers, uri, apiKey }) || [];

  const rulesAreSame = compareArrays(rules, activeRules);
  if (rulesAreSame) {
    console.log(
      "[updateActiveRulesIfEnabled] update requested when no changes in rules exist",
      { activeRules, newRules: rules }
    );
    return [];
  }

  console.log("[updateActiveRulesIfEnabled] new rules:", rules);

  const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
    removeRuleIds: activeRules.map((rule) => rule.id), // remove existing rules
    addRules: rules,
  };

  await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);

  await setModifiersToStorage(modifiers);

  console.log("[updateActiveRulesIfEnabled] update successful");

  return rules;
};

const reloadCurrentTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (activeTab?.id) {
    await chrome.tabs.reload(activeTab.id);
  }
};

const enableExtension = async () => {
  const modifiers = await getModifiersFromStorage();
  const rules = await updateActiveRulesIfEnabled(modifiers);

  await setExtensionEnabledToStorage(true);
  await chrome.action.setIcon({
    path: "icons/logo-32x32.png",
  });

  return rules;
};

const disableExtension = async () => {
  const activeRules = await getActiveRules();

  const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
    removeRuleIds: activeRules.map((rule) => rule.id),
    addRules: [],
  };

  await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);

  await setExtensionEnabledToStorage(false);
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
