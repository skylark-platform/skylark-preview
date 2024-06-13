import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import dayjs from "dayjs";

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
          language: "",
        },
      }),
    { timeout: 5000 },
  );
});

it("changes the time travel time and saves to storage", async () => {
  await act(async () => render(<App />));

  await waitFor(() => {
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  const withinDateTimePicker = within(screen.getByTestId("datetime-picker"));

  const timeTravelInput = withinDateTimePicker.getByLabelText("Time");

  expect(timeTravelInput).toBeInTheDocument();

  await fireEvent.change(timeTravelInput, {
    target: { value: "08:30:00" },
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
          timeTravel: dayjs()
            .hour(8)
            .minute(30)
            .second(0)
            .millisecond(0)
            .toISOString(),
          language: "",
        },
      }),
    { timeout: 5000 },
  );
});

it("changes the time travel date and saves to storage", async () => {
  await act(async () => render(<App />));

  await waitFor(() => {
    expect(screen.getByText("Refresh")).toBeInTheDocument();
  });

  const withinDateTimePicker = within(screen.getByTestId("datetime-picker"));

  const timeTravelInput = withinDateTimePicker.getByLabelText("Date");

  expect(timeTravelInput).toBeInTheDocument();

  await fireEvent.click(timeTravelInput);
  await fireEvent.click(screen.getByText("In a week"));

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
          timeTravel: dayjs()
            .add(1, "week")
            .second(0)
            .millisecond(0)
            .toISOString(),
          language: "",
        },
      }),
    { timeout: 5000 },
  );
});

it("changes the language and saves to storage", async () => {
  await act(async () => render(<App />));

  const customerTypesCombobox = screen.getByRole("combobox", {
    name: "Language",
  });

  expect(customerTypesCombobox).toBeInTheDocument();

  await fireEvent.click(customerTypesCombobox);

  const withinListBox = within(screen.getByRole("listbox"));
  await fireEvent.click(withinListBox.getByText("en-GB"));

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
          timeTravel: "",
          language: "en-GB",
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
          enabledOnSkylarkUI: true,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: true,
          sendDraftHeader: false,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
          language: "",
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

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: false,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: true,
          sendDraftHeader: false,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
          language: "",
        },
      }),
    );
  });

  it("toggles showing the status overlay", async () => {
    await act(async () => render(<App />));

    const input = screen.getByText("Display extension enabled overlay");

    expect(input).toBeInTheDocument();

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: true,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: true,
          sendDraftHeader: false,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
          language: "",
        },
      }),
    );
  });

  it("toggles sending the draft header", async () => {
    await act(async () => render(<App />));

    const input = screen.getByText("Preview draft content");

    expect(input).toBeInTheDocument();

    expect(input).not.toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    await fireEvent.click(input);

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateSettings,
        value: {
          enabledOnSkylarkUI: false,
          sendIgnoreAvailabilityHeader: true,
          showStatusOverlay: true,
          sendDraftHeader: true,
        },
      }),
    );

    await waitFor(() =>
      expect(chrome.runtime.sendMessage).toBeCalledWith({
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "",
          language: "",
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

    await waitFor(() =>
      expect(chrome.storage.sync.set).toBeCalledWith({
        [ExtensionStorageKeys.TempSkylarkUri]:
          "https://api.skylarkplatform.com",
      }),
    );

    await fireEvent.change(apiKeyInput, {
      target: { value: "123456" },
    });

    await waitFor(() =>
      expect(chrome.storage.session.set).toBeCalledWith({
        [ExtensionStorageKeys.TempSkylarkApiKey]: "123456",
      }),
    );

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

    expect(chrome.storage.sync.set).toBeCalledWith({
      [ExtensionStorageKeys.TempSkylarkUri]: "",
    });

    expect(chrome.storage.session.set).toBeCalledWith({
      [ExtensionStorageKeys.TempSkylarkApiKey]: "",
    });
  });
});
