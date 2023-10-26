import {
  ExtensionMessageValueHeaders,
  ExtensionSettings,
  SkylarkCredentials,
} from "../interfaces";

export const convertModifiersToRules = ({
  dimensions,
  timeTravel,
  uri,
  apiKey,
  settings,
}: ExtensionMessageValueHeaders &
  SkylarkCredentials & { settings: ExtensionSettings }):
  | chrome.declarativeNetRequest.Rule[]
  | undefined => {
  if (!apiKey) {
    return undefined;
  }

  const allResourceTypes = Object.values(
    chrome.declarativeNetRequest.ResourceType,
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

  if (settings.sendIgnoreAvailabilityHeader) {
    requestHeaders.push({
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      header: "x-ignore-availability",
      value: "false",
    });
  }

  if (settings.sendDraftHeader) {
    requestHeaders.push({
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      header: "x-draft",
      value: "true",
    });
  }

  // Always bypass cache
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "x-bypass-cache",
    value: "1",
  });

  // Always overwrite the API key so that the user can supply an admin (for time-travel) one but their app can use a readonly one
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "Authorization",
    value: apiKey,
  });

  // Send a marker header so its easy to identify when the Extension is intercepting
  requestHeaders.push({
    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
    header: "x-skylark-preview-enabled",
    value: "true",
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
        excludedInitiatorDomains: settings.enabledOnSkylarkUI
          ? undefined
          : ["app.skylarkplatform.com"],
      },
    },
  ];

  return rules;
};
