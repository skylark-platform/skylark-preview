import {
  ExtensionMessageValueHeaders,
  ExtensionSettings,
  SkylarkCredentials,
} from "../interfaces";

const setOperation = "SET" as chrome.declarativeNetRequest.HeaderOperation.SET;
const modifyHeadersActionType =
  "modifyHeaders" as chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS;

export const convertModifiersToRules = ({
  dimensions,
  timeTravel,
  language,
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
        operation: setOperation,
        header: `x-sl-dimension-${dimension}`,
        value,
      }));

  if (timeTravel) {
    const timeTravelRule: chrome.declarativeNetRequest.ModifyHeaderInfo = {
      operation: setOperation,
      header: "x-time-travel",
      value: timeTravel,
    };
    requestHeaders.push(timeTravelRule);
  }

  if (language) {
    const languageRule: chrome.declarativeNetRequest.ModifyHeaderInfo = {
      operation: setOperation,
      header: "x-language",
      value: language,
    };
    requestHeaders.push(languageRule);
  }

  if (settings.sendIgnoreAvailabilityHeader) {
    requestHeaders.push({
      operation: setOperation,
      header: "x-ignore-availability",
      value: "false",
    });
  }

  if (settings.sendDraftHeader) {
    requestHeaders.push({
      operation: setOperation,
      header: "x-draft",
      value: "true",
    });
  }

  // Always bypass cache
  requestHeaders.push({
    operation: setOperation,
    header: "x-bypass-cache",
    value: "1",
  });

  // Always overwrite the API key so that the user can supply an admin (for time-travel) one but their app can use a readonly one
  requestHeaders.push({
    operation: setOperation,
    header: "Authorization",
    value: apiKey,
  });

  // Send a marker header so its easy to identify when the Extension is intercepting
  requestHeaders.push({
    operation: setOperation,
    header: "x-skylark-preview-enabled",
    value: "true",
  });

  const rules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1,
      priority: 1,
      action: {
        type: modifyHeadersActionType,
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
