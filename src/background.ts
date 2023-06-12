import { EXTENSION_RULES_URL_FILTER } from "./constants";
import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
} from "./interfaces";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getModifiersFromStorage,
  setExtensionEnabledToStorage,
} from "./lib/storage";

const convertModifiersToRules = ({
  dimensions,
  timeTravel,
  apiKey,
}: ExtensionMessageValueHeaders & { apiKey: string }):
  | chrome.declarativeNetRequest.Rule[]
  | undefined => {
  if (!apiKey) {
    return undefined;
  }

  const allResourceTypes = Object.values(
    chrome.declarativeNetRequest.ResourceType
  );

  const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] =
    Object.entries(dimensions).map(([dimension, value]) => ({
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

  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "x-bypass-cache",
    value: "1",
  });

  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "Authorization",
    value: apiKey,
  });

  console.log({ requestHeaders });

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders,
      },
      condition: {
        urlFilter: EXTENSION_RULES_URL_FILTER,
        resourceTypes: allResourceTypes,
      },
    },
  ];

  return rules;
};

const getActiveRules = () => chrome.declarativeNetRequest.getDynamicRules();

const updateRules = async (modifiers: ExtensionMessageValueHeaders) => {
  const activeRules = await getActiveRules();

  const { apiKey } = await getCredentialsFromStorage();

  const rules = convertModifiersToRules({ ...modifiers, apiKey });

  const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
    removeRuleIds: activeRules.map((rule) => rule.id), // remove existing rules
    addRules: rules,
  };

  const updated = await chrome.declarativeNetRequest.updateDynamicRules(
    updateRuleOptions
  );

  console.log({ updated });

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

const toggleExtensionPaused = async () => {
  const extensionEnabled = await getExtensionEnabledFromStorage();

  console.log("toggleExtensionPaused", extensionEnabled);

  if (extensionEnabled) {
    const activeRules = await getActiveRules();

    const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
      removeRuleIds: activeRules.map((rule) => rule.id),
      addRules: [],
    };

    await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);
  } else {
    const modifiers = await getModifiersFromStorage();
    await updateRules(modifiers);
  }
  await setExtensionEnabledToStorage(!extensionEnabled);
};

const handleMessage = async (
  message: ExtensionMessage,
  sendResponse: (message?: chrome.declarativeNetRequest.Rule[]) => void
) => {
  switch (message.type) {
    case ExtensionMessageType.UpdateHeaders:
      return sendResponse(await updateRules(message.value));
    case ExtensionMessageType.TogglePaused:
      await toggleExtensionPaused();
      return sendResponse();
    case ExtensionMessageType.ClearHeaders:
      return sendResponse();
    case ExtensionMessageType.RefreshTab:
      void reloadCurrentTab();
      return sendResponse();
    case ExtensionMessageType.GetActiveHeaders:
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

console.log("Service worker started.");

export {};
