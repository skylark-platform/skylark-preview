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

describe("App", () => {
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

    await waitFor(() =>
      expect(screen.getByText("Standard")).toBeInTheDocument()
    );
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("fetches the latest dimensions and values from Skylark and updates in storage", async () => {
    await act(async () => render(<App />));

    expect(chrome.storage.local.set).toBeCalledWith({
      [ExtensionStorageKeys.Dimensions]: expect.any(Array),
    });
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
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: { "customer-types": "standard" },
          timeTravel: "",
        },
      })
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
        type: ExtensionMessageType.UpdateHeaders,
        value: {
          dimensions: {},
          timeTravel: "2017-06-01T08:30",
        },
      })
    );
  });
});
