import { useEffect, useState } from "react";
import {
  ExtensionMessage,
  ExtensionMessageType,
  ExtensionSettings,
} from "../interfaces";
import {
  getExtensionEnabledFromStorage,
  getExtensionSettingsFromStorage,
} from "../lib/storage";
import { sendExtensionMessage } from "../lib/utils";
import { EXTENSION_SETTINGS_DEFAULTS } from "../constants";

export const useExtensionSettings = () => {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);

  const fetchSettingsFromStorage = async () => {
    const s = await getExtensionSettingsFromStorage();
    setSettings(s || EXTENSION_SETTINGS_DEFAULTS);
  };

  const fetchExtensionEnabledFromStorage = async () => {
    const e = await getExtensionEnabledFromStorage();
    setIsEnabled(e);
  };

  useEffect(() => {
    void fetchExtensionEnabledFromStorage();
    void fetchSettingsFromStorage();
  }, []);

  const updateSettings = async (updatedSettings: ExtensionSettings) => {
    await sendExtensionMessage({
      type: ExtensionMessageType.UpdateSettings,
      value: updatedSettings,
    });
    setSettings(updatedSettings);
  };

  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _, sendResponse) => {
      if (message.type === ExtensionMessageType.UpdateSettings) {
        setSettings(message.value);
      } else if (message.type === ExtensionMessageType.EnableExtension) {
        setIsEnabled(true);
      } else if (message.type === ExtensionMessageType.DisableExtension) {
        setIsEnabled(false);
      }
      sendResponse();
      return true;
    },
  );

  return {
    settings,
    isEnabled,
    updateSettings,
  };
};
