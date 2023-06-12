import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
} from "./interfaces";
import {
  getCredentialsFromStorage,
  getModifiersFromStorage,
  setExtensionEnabledToStorage,
} from "./lib/storage";

const convertModifiersToRules = ({
  dimensions,
  timeTravel,
  uri,
  apiKey,
}: ExtensionMessageValueHeaders & { apiKey: string; uri: string }):
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
      .filter(([_, value]) => value)
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

  console.log({ requestHeaders, uri });

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

const updateRules = async (modifiers: ExtensionMessageValueHeaders) => {
  const activeRules = await getActiveRules();

  const { uri, apiKey } = await getCredentialsFromStorage();

  const rules = convertModifiersToRules({ ...modifiers, uri, apiKey });

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

const toggleExtensionPaused = async (shouldEnable: boolean) => {
  if (shouldEnable) {
    const modifiers = await getModifiersFromStorage();
    await updateRules(modifiers);
  } else {
    const activeRules = await getActiveRules();

    const updateRuleOptions: chrome.declarativeNetRequest.UpdateRuleOptions = {
      removeRuleIds: activeRules.map((rule) => rule.id),
      addRules: [],
    };

    await chrome.declarativeNetRequest.updateDynamicRules(updateRuleOptions);
  }

  await setExtensionEnabledToStorage(shouldEnable);
  await chrome.action.setIcon({
    path: shouldEnable
      ? "icons/logo-32x32.png"
      : "icons/logo-grayscale-32x32.png",
  });
};

const handleMessage = async (
  message: ExtensionMessage,
  sendResponse: (message?: chrome.declarativeNetRequest.Rule[]) => void
) => {
  switch (message.type) {
    case ExtensionMessageType.UpdateHeaders:
      return sendResponse(await updateRules(message.value));
    case ExtensionMessageType.EnableExtension:
    case ExtensionMessageType.DisableExtension:
      await toggleExtensionPaused(
        message.type === ExtensionMessageType.EnableExtension
      );
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
