export interface ExtensionSettings {
  enabledOnSkylarkUI: boolean;
  sendIgnoreAvailabilityHeader: boolean;
  showStatusOverlay: boolean;
}

export enum ExtensionMessageType {
  UpdateHeaders = "UpdateHeaders",
  GetActiveHeaders = "GetActiveHeaders",
  ClearHeaders = "ClearHeaders",
  RefreshTab = "RefreshTab",
  EnableExtension = "EnableExtension",
  DisableExtension = "DisableExtension",
  UpdateSettings = "UpdateSettings",
}

export type ExtensionMessageValueHeaders = {
  timeTravel: string;
  dimensions: Record<string, string>;
};

export type ExtensionMessage =
  | {
      type: ExtensionMessageType.UpdateHeaders;
      value: ExtensionMessageValueHeaders;
    }
  | {
      type: ExtensionMessageType.UpdateSettings;
      value: ExtensionSettings;
    }
  | {
      type:
        | ExtensionMessageType.GetActiveHeaders
        | ExtensionMessageType.ClearHeaders
        | ExtensionMessageType.EnableExtension
        | ExtensionMessageType.DisableExtension
        | ExtensionMessageType.RefreshTab;
    };
