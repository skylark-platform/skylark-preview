import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";

import App from "../app";
import { ExtensionStorageKeys } from "../constants";
import { ExtensionMessageType } from "../interfaces";
import { vi } from "vitest";
import { storageGetHandler } from "../../setupTests";

it("renders the app as expected", async () => {
  await act(async () => render(<App />));

  expect(screen.getByText("Skylark Preview")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
});

it("renders two comboboxes for the dimensions and expands", async () => {
  await act(async () => render(<App />));

  const customerTypesCombobox = screen.getByRole("combobox", {
    name: "Customer Type",
  });
  const deviceTypesCombobox = screen.getByRole("combobox", {
    name: "Device Type",
  });

  expect(customerTypesCombobox).toBeInTheDocument();
  expect(deviceTypesCombobox).toBeInTheDocument();

  await fireEvent.click(customerTypesCombobox);

  await waitFor(() => expect(screen.getByText("Standard")).toBeInTheDocument());
  expect(screen.getByText("Premium")).toBeInTheDocument();
});

it("fetches the latest dimensions and values from Skylark and updates in storage", async () => {
  await act(async () => render(<App />));

  await waitFor(() =>
    expect(chrome.storage.local.set).toBeCalledWith({
      [ExtensionStorageKeys.Dimensions]: expect.any(Array),
    }),
  );
});

it("changes an active dimension and saves to storage", async () => {
  await act(async () => render(<App />));

  const customerTypesCombobox = screen.getByRole("combobox", {
    name: "Customer Type",
  });

  expect(customerTypesCombobox).toBeInTheDocument();

  await fireEvent.click(customerTypesCombobox);

  const withinListBox = within(screen.getByRole("listbox"));
  await fireEvent.click(withinListBox.getByText("Standard"));

  await waitFor(() =>
    expect(chrome.runtime.sendMessage).toBeCalledWith({
      type: ExtensionMessageType.UpdateSettings,
      value: expect.any(Object),
    }),
  );

  await waitFor(
    () =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: { "customer-types": "standard" },
          timeTravel: "",
        },
      }),
    { timeout: 5000 },
  );
});

it("changes the time travel and saves to storage", async () => {
  await act(async () => render(<App />));

  const timeTravelInput = screen.getByLabelText("time-travel");

  expect(timeTravelInput).toBeInTheDocument();

  await fireEvent.change(timeTravelInput, {
    target: { value: "2017-06-01T08:30" },
  });

  await waitFor(() =>
    expect(chrome.runtime.sendMessage).toBeCalledWith({
      type: ExtensionMessageType.UpdateSettings,
      value: expect.any(Object),
    }),
  );

  await waitFor(
    () =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "2017-06-01T08:30",
        },
      }),
    { timeout: 5000 },
  );
});

describe("Settings", () => {
  it("toggles the enabled on Skylark UI and saves to storage", async () => {
    await act(async () => render(<App />));

    const input = screen.getByText("Intercept requests on the Skylark app UI");

    expect(input).toBeInTheDocument();

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: false,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: true,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
        },
      }),
    );
  });

  it("toggles sending the Ignore Availability header", async () => {
    await act(async () => render(<App />));

    const input = screen.getByText(
      "Include the Ignore Availability header (Advanced)",
    );

    expect(input).toBeInTheDocument();

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: true,
          sendIgnoreAvailabilityHeader: false,
          showStatusOverlay: true,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
        },
      }),
    );
  });

  it("toggles showing the status overlay", async () => {
    await act(async () => render(<App />));

    const input = screen.getByText("Show extension enabled overlay");

    expect(input).toBeInTheDocument();

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: true,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: false,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
        },
      }),
    );
  });
});

describe("Unauthenticated", () => {
  beforeEach(() => {
    const storageHandler = storageGetHandler({
      [ExtensionStorageKeys.SkylarkUri]: "",
      [ExtensionStorageKeys.SkylarkApiKey]: "",
    });
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
    };

    vi.stubGlobal("chrome", chrome);
  });

  it("renders the login screen when no credentials exist", async () => {
    await act(async () => render(<App />));

    expect(
      screen.getByText("Enter your Skylark credentials"),
    ).toBeInTheDocument();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("enters credentials and saves them", async () => {
    await act(async () => render(<App />));

    const urlInput = screen.getByLabelText("skylark-api-url");
    const apiKeyInput = screen.getByLabelText("skylark-api-key");

    await fireEvent.change(urlInput, {
      target: { value: "https://api.skylarkplatform.com" },
    });

    await fireEvent.change(apiKeyInput, {
      target: { value: "123456" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Verifying...")).not.toBeInTheDocument();
    });

    const connectButton = screen.getByText("Connect");

    await waitFor(() => {
      expect(connectButton).toBeEnabled();
    });

    await fireEvent.click(connectButton);

    await waitFor(() =>
      expect(chrome.storage.sync.set).toBeCalledWith({
        [ExtensionStorageKeys.SkylarkUri]: "https://api.skylarkplatform.com",
      }),
    );

    await waitFor(() =>
      expect(chrome.storage.session.set).toBeCalledWith({
        [ExtensionStorageKeys.SkylarkApiKey]: "123456",
      }),
    );
  });
});
