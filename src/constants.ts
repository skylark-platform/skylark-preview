import { ExtensionSettings } from "./interfaces";

export enum QueryKeys {
  AvailabilityDimensions = "availabilityDimensions",
}

export enum ExtensionStorageKeys {
  SkylarkUri = "SkylarkUri",
  SkylarkApiKey = "SkylarkApiKey",
  TempSkylarkUri = "TEMPSkylarkUri",
  TempSkylarkApiKey = "TEMPSkylarkApiKey",
  Modifiers = "Modifiers",
  ExtensionEnabled = "ExtensionEnabled",
  Dimensions = "Dimensions",
  Settings = "Settings",
}

export const EXTENSION_SETTINGS_DEFAULTS: ExtensionSettings = {
  enabledOnSkylarkUI: false,
  sendIgnoreAvailabilityHeader: false,
  showStatusOverlay: false, // to prevent blip
  sendDraftHeader: false,
};
