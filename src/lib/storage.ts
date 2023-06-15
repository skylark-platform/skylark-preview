import { ExtensionStorageKeys } from "../constants";
import {
  ExtensionMessageValueHeaders,
  ParsedSkylarkDimensionsWithValues,
  SkylarkCredentials,
} from "../interfaces";

export const getCredentialsFromStorage = async () => {
  const uriRes = (await chrome.storage.sync.get(
    ExtensionStorageKeys.SkylarkUri
  )) as { [ExtensionStorageKeys.SkylarkUri]: string };
  const apiKeyRes = (await chrome.storage.session.get(
    ExtensionStorageKeys.SkylarkApiKey
  )) as { [ExtensionStorageKeys.SkylarkApiKey]: string };

  const uri = uriRes[ExtensionStorageKeys.SkylarkUri];
  const apiKey = apiKeyRes[ExtensionStorageKeys.SkylarkApiKey];

  return {
    uri,
    apiKey,
  };
};

export const setCredentialsToStorage = async ({
  uri,
  apiKey,
}: SkylarkCredentials) => {
  await chrome.storage.sync.set({
    [ExtensionStorageKeys.SkylarkUri]: uri,
  });
  await chrome.storage.session.set({
    [ExtensionStorageKeys.SkylarkApiKey]: apiKey,
  });
};

export const getModifiersFromStorage =
  async (): Promise<ExtensionMessageValueHeaders> => {
    const res = (await chrome.storage.local.get(
      ExtensionStorageKeys.Modifiers
    )) as { [ExtensionStorageKeys.Modifiers]: ExtensionMessageValueHeaders };

    return res[ExtensionStorageKeys.Modifiers];
  };

export const setModifiersToStorage = async (
  modifiers: ExtensionMessageValueHeaders
) => {
  console.log("[setModifiersToStorage] modifiers saved to storage:", modifiers);
  await chrome.storage.local.set({
    [ExtensionStorageKeys.Modifiers]: modifiers,
  });
};

export const getExtensionEnabledFromStorage = async (): Promise<boolean> => {
  const res = (await chrome.storage.local.get(
    ExtensionStorageKeys.ExtensionEnabled
  )) as { [ExtensionStorageKeys.ExtensionEnabled]: boolean };

  return res[ExtensionStorageKeys.ExtensionEnabled];
};

export const setExtensionEnabledToStorage = async (enabled: boolean) => {
  console.log(
    "[setExtensionEnabledToStorage] enabled state updated:",
    enabled ? "ENABLED" : "DISABLED"
  );
  await chrome.storage.local.set({
    [ExtensionStorageKeys.ExtensionEnabled]: enabled,
  });
};

export const getParsedDimensionsFromStorage = async (): Promise<
  ParsedSkylarkDimensionsWithValues[] | undefined
> => {
  const res = (await chrome.storage.local.get(
    ExtensionStorageKeys.Dimensions
  )) as {
    [ExtensionStorageKeys.Dimensions]:
      | ParsedSkylarkDimensionsWithValues[]
      | undefined;
  };

  return res[ExtensionStorageKeys.Dimensions];
};

export const setParsedDimensionsToStorage = async (
  dimensions: ParsedSkylarkDimensionsWithValues[]
) => {
  console.log(
    "[setParsedDimensionsToStorage] dimensions from server saved to storage:",
    dimensions
  );
  await chrome.storage.local.set({
    [ExtensionStorageKeys.Dimensions]: dimensions,
  });
};
