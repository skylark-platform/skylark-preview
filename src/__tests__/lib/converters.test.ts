import {
  ExtensionMessageValueHeaders,
  ExtensionSettings,
} from "../../interfaces";
import { convertModifiersToRules } from "../../lib/converters";

const modifiers: ExtensionMessageValueHeaders = {
  timeTravel: "to-tomorrow",
  dimensions: {
    "customer-type": "premium",
    "device-type": "pc",
  },
};

const credentials = {
  uri: "https://skylark.com",
  apiKey: "12345",
};

const settings: ExtensionSettings = {
  enabledOnSkylarkUI: true,
  sendIgnoreAvailabilityHeader: true,
};

describe("convertModifiersToRules", () => {
  it("if apiKey isn't supplied, returns undefined", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
      apiKey: "",
      settings,
    });

    expect(got).toBe(undefined);
  });

  it("returns the expected rules when all options are supplied", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
      settings,
    });

    expect(got).toEqual([
      {
        action: {
          requestHeaders: Object.entries({
            "x-sl-dimension-customer-type":
              modifiers.dimensions["customer-type"],
            "x-sl-dimension-device-type": modifiers.dimensions["device-type"],
            "x-time-travel": modifiers.timeTravel,
            "x-bypass-cache": "1",
            "x-ignore-availability": "false",
            Authorization: credentials.apiKey,
            "x-skylark-preview-enabled": "true",
          }).map(([header, value]) => ({
            header,
            operation: "SET",
            value,
          })),
        },
        condition: {
          resourceTypes: ["XMLHttpRequest"],
          urlFilter: credentials.uri,
        },
        id: 1,
        priority: 1,
      },
    ]);
  });

  it("does not add the ignore-availability requestHeader when settings.sendIgnoreAvailabilityHeader is false", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
      settings: {
        ...settings,
        sendIgnoreAvailabilityHeader: false,
      },
    });

    expect(got?.[0].action.requestHeaders).not.toHaveProperty(
      "x-ignore-availability"
    );
  });

  it("adds the Skylark UI domain into the excludedInitiatorDomains arr when settings.enabledOnSkylarkUI is false", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
      settings: {
        ...settings,
        enabledOnSkylarkUI: false,
      },
    });

    expect(got).toEqual([
      {
        action: expect.any(Object),
        condition: {
          resourceTypes: ["XMLHttpRequest"],
          urlFilter: credentials.uri,
          excludedInitiatorDomains: ["app.skylarkplatform.com"],
        },
        id: 1,
        priority: 1,
      },
    ]);
  });
});
