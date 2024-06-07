import { vi } from "vitest";
import { ExtensionStorageKeys } from "./src/constants";
import {
  ExtensionMessageValueHeaders,
  ParsedSkylarkDimensionsWithValues,
} from "./src/interfaces";

import matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import { server } from "./src/__mocks__/server";

expect.extend(matchers);

const defaultDimensions: ParsedSkylarkDimensionsWithValues[] = [
  {
    uid: "dimension_1",
    external_id: "dimension_1",
    title: "Customer Type",
    slug: "customer-types",
    description: "",
    values: [
      {
        uid: "customer_type_1",
        external_id: "customer_type_1",
        slug: "standard",
        title: "Standard",
        description: "",
      },
      {
        uid: "customer_type_2",
        external_id: "customer_type_2",
        slug: "premium",
        title: "Premium",
        description: "",
      },
    ],
  },
  {
    uid: "dimension_2",
    external_id: "dimension_2",
    title: "Device Type",
    slug: "device-types",
    description: "",
    values: [
      {
        uid: "device_type_1",
        external_id: "device_type_1",
        slug: "dt1",
        title: "PC",
        description: "",
      },
      {
        uid: "device_type_2",
        external_id: "device_type_2",
        slug: "dt2",
        title: "Mobile",
        description: "",
      },
    ],
  },
];

export const storageGetHandler = (
  customValues?: Partial<Record<ExtensionStorageKeys, unknown>>,
) => {
  return () => ({
    [ExtensionStorageKeys.Dimensions]: defaultDimensions,
    [ExtensionStorageKeys.ExtensionEnabled]: true,
    [ExtensionStorageKeys.Modifiers]: {
      timeTravel: "",
      dimensions: {},
      language: "",
    } satisfies ExtensionMessageValueHeaders,
    [ExtensionStorageKeys.SkylarkUri]: "https://skylark.com/graphql",
    [ExtensionStorageKeys.SkylarkApiKey]: "api-key",
    ...customValues,
  });
};
const storageHandler = storageGetHandler();
const chrome = {
  storage: {
    local: {
      get: vi.fn(storageHandler),
      set: vi.fn(storageHandler),
    },
    sync: {
      get: vi.fn(storageHandler),
      set: vi.fn(storageHandler),
    },
    session: {
      get: vi.fn(storageHandler),
      set: vi.fn(storageHandler),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
  },
  declarativeNetRequest: {
    ResourceType: ["XMLHttpRequest"],
    HeaderOperation: {
      SET: "SET",
    },
    RuleActionType: {
      ModifyHeaders: "ModifyHeaders",
    },
  },
};
vi.stubGlobal("chrome", chrome);

vi.stubGlobal("console", { log: vi.fn(), error: vi.fn() });

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
