import { ExtensionSettings } from "./interfaces";

export enum QueryKeys {
  AvailabilityDimensions = "availabilityDimensions",
}

export enum ExtensionStorageKeys {
  SkylarkUri = "SkylarkUri",
  SkylarkApiKey = "SkylarkApiKey",
  Modifiers = "Modifiers",
  ExtensionEnabled = "ExtensionEnabled",
  Dimensions = "Dimensions",
  Settings = "Settings",
}

export const EXTENSION_SETTINGS_DEFAULTS: ExtensionSettings = {
  enabledOnSkylarkUI: false,
  sendIgnoreAvailabilityHeader: true,
  showStatusOverlay: false, // to prevent blip
  sendDraftHeader: false,
};
