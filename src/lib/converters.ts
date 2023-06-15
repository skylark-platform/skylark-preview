import {
  ExtensionMessageValueHeaders,
  SkylarkCredentials,
} from "../interfaces";

export const convertModifiersToRules = ({
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
