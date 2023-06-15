export enum ExtensionMessageType {
  UpdateHeaders = "UpdateHeaders",
  GetActiveHeaders = "GetActiveHeaders",
  ClearHeaders = "ClearHeaders",
  RefreshTab = "RefreshTab",
  EnableExtension = "EnableExtension",
  DisableExtension = "DisableExtension",
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
      type:
        | ExtensionMessageType.GetActiveHeaders
        | ExtensionMessageType.ClearHeaders
        | ExtensionMessageType.EnableExtension
        | ExtensionMessageType.DisableExtension
        | ExtensionMessageType.RefreshTab;
    };
