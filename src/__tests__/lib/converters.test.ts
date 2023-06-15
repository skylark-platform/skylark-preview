import { ExtensionMessageValueHeaders } from "../../interfaces";
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

describe("convertModifiersToRules", () => {
  it("if apiKey isn't supplied, returns undefined", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
      apiKey: "",
    });

    expect(got).toBe(undefined);
  });

  it("returns the expected rules when all options are supplied", () => {
    const got = convertModifiersToRules({
      ...modifiers,
      ...credentials,
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
});
