import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "use-debounce";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { AvailabilityModifier } from "./components/availabilityModifier";
import {
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
  ExtensionSettings,
  ParsedSkylarkDimensionsWithValues,
  PopupTab,
  SkylarkCredentials,
} from "./interfaces";
import { sendExtensionMessage } from "./lib/utils";
import { ConnectToSkylark } from "./components/connectToSkylark";
import { DisabledOverlay } from "./components/disabledOverlay";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getExtensionSettingsFromStorage,
  getModifiersFromStorage,
  getParsedDimensionsFromStorage,
} from "./lib/storage";
import { Settings } from "./components/settings";
import { EXTENSION_SETTINGS_DEFAULTS } from "./constants";
import { useConnectedToSkylark } from "./hooks/useConnectedToSkylark";

export const Popup = () => {
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const toggleEnabled = useCallback(async () => {
    const isNowEnabled = !extensionEnabled;
    await sendExtensionMessage({
      type: isNowEnabled
        ? ExtensionMessageType.EnableExtension
        : ExtensionMessageType.DisableExtension,
    });
    setExtensionEnabled(isNowEnabled);
  }, [extensionEnabled]);

  const [settings, setSettings] = useState<ExtensionSettings | null>(null);

  const [tab, setTab] = useState<PopupTab>(PopupTab.Main);

  const [creds, setCreds] = useState<SkylarkCredentials | undefined>();

  const [dimensionsFromStorage, setDimensionsFromStorage] = useState<
    undefined | ParsedSkylarkDimensionsWithValues[]
  >();

  const [activeModifiers, setActiveModifiers] =
    useState<ExtensionMessageValueHeaders | null>(null);

  const [debouncedActiveModifiers] = useDebounce(activeModifiers, 1000);

  const fetchCredentialsFromStorage = async () => {
    const storageCreds = await getCredentialsFromStorage();
    if (storageCreds) setCreds(storageCreds);
  };

  const fetchModifiersFromStorage = async () => {
    const initialModifiers = await getModifiersFromStorage();
    setActiveModifiers(initialModifiers || { dimensions: {}, timeTravel: "" });
  };

  const fetchExtensionEnabledFromStorage = async () => {
    const enabled = await getExtensionEnabledFromStorage();
    setExtensionEnabled(enabled || false);
  };

  const fetchDimensionsFromStorage = async () => {
    const initialDimensions = await getParsedDimensionsFromStorage();
    if (initialDimensions) setDimensionsFromStorage(initialDimensions);
  };

  const fetchSettingsFromStorage = async () => {
    const settings = await getExtensionSettingsFromStorage();

    setSettings(settings || EXTENSION_SETTINGS_DEFAULTS);
  };

  useEffect(() => {
    void fetchCredentialsFromStorage();
    void fetchModifiersFromStorage();
    void fetchExtensionEnabledFromStorage();
    void fetchDimensionsFromStorage();
    void fetchSettingsFromStorage();
  }, []);

  const [isHeadersUpdating, setIsHeadersUpdating] = useState(false);

  const updateHeadersAndSettings = async (
    modifiers: ExtensionMessageValueHeaders,
    settings: ExtensionSettings,
  ) => {
    setIsHeadersUpdating(true);

    await sendExtensionMessage({
      type: ExtensionMessageType.UpdateSettings,
      value: settings,
    });

    await sendExtensionMessage({
      type: ExtensionMessageType.UpdateHeaders,
      value: modifiers,
    });

    setIsHeadersUpdating(false);
  };

  useEffect(() => {
    if (extensionEnabled && settings && debouncedActiveModifiers) {
      void updateHeadersAndSettings(debouncedActiveModifiers, settings);
    }
  }, [debouncedActiveModifiers, extensionEnabled, settings]);

  const { isConnected, isLoading } = useConnectedToSkylark(
    creds || { uri: "", apiKey: "" },
    { withInterval: true },
  );

  useEffect(() => {
    const hasCreds = creds?.uri && creds?.apiKey;
    const credsAreInvalid = hasCreds && !isConnected && !isLoading;

    if (
      creds !== undefined &&
      (!hasCreds || credsAreInvalid) &&
      tab !== PopupTab.Auth
    ) {
      setTab(PopupTab.Auth);
      // If the credentials are missing, disable
      void sendExtensionMessage({
        type: ExtensionMessageType.DisableExtension,
      });
    }
  }, [creds, tab, isConnected, isLoading]);

  return (
    <div className="font-body relative flex min-h-[600px] flex-grow flex-col items-start justify-start bg-white">
      <div className="fixed left-0 right-0 z-10 h-16">
        <Header
          credentialsAdded={!!creds?.apiKey && !!creds?.uri}
          active={extensionEnabled}
          toggleEnabled={() => {
            void toggleEnabled();
          }}
          tab={tab}
          onSettingsClick={() => {
            if (!(creds?.apiKey && creds?.uri)) {
              return;
            }
            setTab((prevTab) =>
              prevTab === PopupTab.Settings ? PopupTab.Main : PopupTab.Settings,
            );
          }}
        />
      </div>
      <main className="relative mt-16 flex h-full w-full flex-grow flex-col justify-start pb-14">
        {!creds || !activeModifiers || !settings ? (
          <div className="my-8 px-4">{`Loading...`}</div>
        ) : (
          <>
            {(tab === PopupTab.Auth || tab === PopupTab.Settings) && (
              <ConnectToSkylark
                variant="unauthenticated"
                className="px-4"
                skylarkCreds={creds}
                onUpdate={(updatedCredentials) => {
                  if (!updatedCredentials) {
                    setExtensionEnabled(false);
                    setCreds({ uri: "", apiKey: "" });
                  } else {
                    setTab(PopupTab.Main);
                    setCreds(updatedCredentials);
                    setExtensionEnabled(true);
                    sendExtensionMessage({
                      type: ExtensionMessageType.EnableExtension,
                    });
                  }
                }}
              />
            )}
            {tab === PopupTab.Main && (
              <>
                <DisabledOverlay show={!extensionEnabled} />
                <AvailabilityModifier
                  activeModifiers={activeModifiers}
                  className="mb-2 px-4"
                  dimensionsFromStorage={dimensionsFromStorage}
                  setActiveModifiers={setActiveModifiers}
                  skylarkCreds={creds}
                />
                <Settings
                  settings={settings}
                  updateSettings={setSettings}
                  className="mt-4 px-4"
                  skylarkCreds={creds}
                />
              </>
            )}
            {/* {tab === PopupTab.Settings && (
              <>
                <DisabledOverlay show={!extensionEnabled} />
                <Settings
                  settings={settings}
                  updateSettings={setSettings}
                  className="mt-4 h-full px-4"
                />
                <ConnectToSkylark
                  variant="authenticated"
                  className="px-4"
                  skylarkCreds={creds}
                  onUpdate={(updatedCredentials) => {
                    if (!updatedCredentials) {
                      setExtensionEnabled(false);
                      setCreds({ uri: "", apiKey: "" });
                    } else {
                      setTab(PopupTab.Main);
                      setCreds(updatedCredentials);
                      setExtensionEnabled(true);
                      sendExtensionMessage({
                        type: ExtensionMessageType.EnableExtension,
                      });
                    }
                  }}
                />
              </>
            )} */}
          </>
        )}
      </main>
      <div className="fixed bottom-0 left-0 right-0">
        <Footer
          isHeadersUpdating={
            extensionEnabled &&
            (isHeadersUpdating || activeModifiers !== debouncedActiveModifiers)
          }
        />
      </div>
    </div>
  );
};
