import { ExtensionStorageKeys } from "../constants";
import {
  ExtensionMessageValueHeaders,
  ExtensionSettings,
  ParsedSkylarkDimensionsWithValues,
  SkylarkCredentials,
} from "../interfaces";

export const getCredentialsFromStorage = async () => {
  const uriRes = (await browser.storage.sync.get(
    ExtensionStorageKeys.SkylarkUri,
  )) as { [ExtensionStorageKeys.SkylarkUri]: string };
  const apiKeyRes = (await browser.storage.session.get(
    ExtensionStorageKeys.SkylarkApiKey,
  )) as { [ExtensionStorageKeys.SkylarkApiKey]: string };

  const uri = uriRes[ExtensionStorageKeys.SkylarkUri];
  const apiKey = apiKeyRes[ExtensionStorageKeys.SkylarkApiKey];

  return {
    uri,
    apiKey,
  };
};

export const getTempCredentialsFromStorage = async () => {
  const uriRes = (await browser.storage.sync.get(
    ExtensionStorageKeys.TempSkylarkUri,
  )) as { [ExtensionStorageKeys.TempSkylarkUri]: string };
  const apiKeyRes = (await browser.storage.session.get(
    ExtensionStorageKeys.TempSkylarkApiKey,
  )) as { [ExtensionStorageKeys.TempSkylarkApiKey]: string };

  const uri = uriRes[ExtensionStorageKeys.TempSkylarkUri];
  const apiKey = apiKeyRes[ExtensionStorageKeys.TempSkylarkApiKey];

  return {
    uri,
    apiKey,
  };
};

export const setCredentialsToStorage = async ({
  uri,
  apiKey,
  useTempStorage,
}: SkylarkCredentials & { useTempStorage?: boolean }) => {
  await browser.storage.sync.set({
    [useTempStorage
      ? ExtensionStorageKeys.TempSkylarkUri
      : ExtensionStorageKeys.SkylarkUri]: uri,
  });
  await browser.storage.session.set({
    [useTempStorage
      ? ExtensionStorageKeys.TempSkylarkApiKey
      : ExtensionStorageKeys.SkylarkApiKey]: apiKey,
  });
};

export const getModifiersFromStorage =
  async (): Promise<ExtensionMessageValueHeaders> => {
    const res = (await browser.storage.local.get(
      ExtensionStorageKeys.Modifiers,
    )) as { [ExtensionStorageKeys.Modifiers]: ExtensionMessageValueHeaders };

    return res[ExtensionStorageKeys.Modifiers];
  };

export const setModifiersToStorage = async (
  modifiers: ExtensionMessageValueHeaders,
) => {
  console.log("[setModifiersToStorage] modifiers saved to storage:", modifiers);
  await browser.storage.local.set({
    [ExtensionStorageKeys.Modifiers]: modifiers,
  });
};

export const getExtensionEnabledFromStorage = async (): Promise<boolean> => {
  const res = (await browser.storage.local.get(
    ExtensionStorageKeys.ExtensionEnabled,
  )) as { [ExtensionStorageKeys.ExtensionEnabled]: boolean | undefined };

  const enabled = res[ExtensionStorageKeys.ExtensionEnabled];

  return enabled === undefined ? true : enabled;
};

export const setExtensionEnabledToStorage = async (enabled: boolean) => {
  console.log(
    "[setExtensionEnabledToStorage] enabled state updated:",
    enabled ? "ENABLED" : "DISABLED",
  );
  await browser.storage.local.set({
    [ExtensionStorageKeys.ExtensionEnabled]: enabled,
  });
};

export const getParsedDimensionsFromStorage = async (): Promise<
  ParsedSkylarkDimensionsWithValues[] | undefined
> => {
  const res = (await browser.storage.local.get(
    ExtensionStorageKeys.Dimensions,
  )) as {
    [ExtensionStorageKeys.Dimensions]:
      | ParsedSkylarkDimensionsWithValues[]
      | undefined;
  };

  return res[ExtensionStorageKeys.Dimensions];
};

export const setParsedDimensionsToStorage = async (
  dimensions: ParsedSkylarkDimensionsWithValues[],
) => {
  console.log(
    "[setParsedDimensionsToStorage] dimensions from server saved to storage:",
    dimensions,
  );
  await browser.storage.local.set({
    [ExtensionStorageKeys.Dimensions]: dimensions,
  });
};

export const getExtensionSettingsFromStorage =
  async (): Promise<ExtensionSettings> => {
    const res = (await browser.storage.local.get(
      ExtensionStorageKeys.Settings,
    )) as { [ExtensionStorageKeys.Settings]: ExtensionSettings | undefined };
    const settings = res[ExtensionStorageKeys.Settings];

    return {
      enabledOnSkylarkUI: false,
      sendIgnoreAvailabilityHeader: true,
      showStatusOverlay: true,
      sendDraftHeader: false,
      ...settings,
    };
  };

export const setExtensionSettingsToStorage = async (
  settings: ExtensionSettings,
) => {
  console.log(
    "[setExtensionSettingsToStorage] settings saved to storage:",
    settings,
  );
  await browser.storage.local.set({
    [ExtensionStorageKeys.Settings]: settings,
  });
};
