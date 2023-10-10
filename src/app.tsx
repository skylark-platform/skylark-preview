import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/inter";

import "./index.css";
import { useDebounce } from "use-debounce";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import { AvailabilityModifier } from "./components/availabilityModifier";
import {
  ExtensionMessageType,
  ExtensionMessageValueHeaders,
  ParsedSkylarkDimensionsWithValues,
  SkylarkCredentials,
} from "./interfaces";
import { sendExtensionMessage } from "./lib/utils";
import { ConnectToSkylark } from "./components/connectToSkylark";
import { DisabledOverlay } from "./components/disabledOverlay";
import {
  getCredentialsFromStorage,
  getExtensionEnabledFromStorage,
  getExtensionEnabledOnSkylarkUIFromStorage,
  getModifiersFromStorage,
  getParsedDimensionsFromStorage,
} from "./lib/storage";
import { Settings } from "./components/settings";

export const App = () => {
  const queryClient = new QueryClient();

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

  const [enabledOnSkylarkUI, setEnabledOnSkylarkUI] = useState(true);

  const [showCredentialsScreen, setShowCredentialsScreen] = useState(false);

  const [creds, setCreds] = useState<SkylarkCredentials | undefined>();

  const [dimensionsFromStorage, setDimensionsFromStorage] = useState<
    undefined | ParsedSkylarkDimensionsWithValues[]
  >();

  const [activeModifiers, setActiveModifiers] =
    useState<ExtensionMessageValueHeaders>({ timeTravel: "", dimensions: {} });

  const [debouncedActiveModifiers] = useDebounce(activeModifiers, 1000);

  const fetchCredentialsFromStorage = async () => {
    const storageCreds = await getCredentialsFromStorage();
    if (storageCreds) setCreds(storageCreds);
  };

  const fetchModifiersFromStorage = async () => {
    const initialModifiers = await getModifiersFromStorage();
    if (initialModifiers) setActiveModifiers(initialModifiers);
  };

  const fetchExtensionEnabledFromStorage = async () => {
    const enabled = await getExtensionEnabledFromStorage();
    setExtensionEnabled(enabled || false);
  };

  const fetchDimensionsFromStorage = async () => {
    const initialDimensions = await getParsedDimensionsFromStorage();
    if (initialDimensions) setDimensionsFromStorage(initialDimensions);
  };

  const fetchEnabledOnSkylarkUIFromStorage = async () => {
    const initialEnabledOnSkylarkUI =
      await getExtensionEnabledOnSkylarkUIFromStorage();
    setEnabledOnSkylarkUI(initialEnabledOnSkylarkUI);
  };

  useEffect(() => {
    void fetchCredentialsFromStorage();
    void fetchModifiersFromStorage();
    void fetchExtensionEnabledFromStorage();
    void fetchDimensionsFromStorage();
    void fetchEnabledOnSkylarkUIFromStorage();
  }, []);

  const [isHeadersUpdating, setIsHeadersUpdating] = useState(false);

  const updateHeaders = async (
    modifiers: ExtensionMessageValueHeaders,
    enabledOnSkylarkUI: boolean
  ) => {
    setIsHeadersUpdating(true);
    await sendExtensionMessage({
      type: ExtensionMessageType.UpdateHeaders,
      value: {
        availability: modifiers,
        options: { enabledOnSkylarkUI },
      },
    });
    setIsHeadersUpdating(false);
  };

  useEffect(() => {
    if (extensionEnabled) {
      void updateHeaders(debouncedActiveModifiers, enabledOnSkylarkUI);
    }
  }, [debouncedActiveModifiers, enabledOnSkylarkUI, extensionEnabled]);

  useEffect(() => {
    if (
      creds !== undefined &&
      (!creds?.uri || !creds?.apiKey) &&
      !showCredentialsScreen
    ) {
      setShowCredentialsScreen(true);
    }
  }, [creds, showCredentialsScreen]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-body flex h-screen flex-grow flex-col items-start justify-start bg-white">
        <div className="fixed left-0 right-0 z-10 h-16">
          <Header
            credentialsAdded={!!creds?.apiKey && !!creds?.uri}
            active={extensionEnabled}
            toggleEnabled={() => {
              void toggleEnabled();
            }}
            onChangeCredentials={() => {
              if (showCredentialsScreen && !(creds?.apiKey && creds?.uri)) {
                return;
              }
              setShowCredentialsScreen(!showCredentialsScreen);
            }}
          />
        </div>
        <main className="relative mt-16 flex h-full w-full flex-grow flex-col">
          {!creds ? (
            <div className="my-8 px-4">{`Loading...`}</div>
          ) : (
            <>
              {showCredentialsScreen ? (
                <ConnectToSkylark
                  className="px-4"
                  skylarkCreds={creds}
                  onUpdate={(updatedCredentials) => {
                    if (!updatedCredentials) {
                      setExtensionEnabled(false);
                      setCreds({ uri: "", apiKey: "" });
                    } else {
                      setShowCredentialsScreen(false);
                      setCreds(updatedCredentials);
                      setExtensionEnabled(true);
                      sendExtensionMessage({
                        type: ExtensionMessageType.EnableExtension,
                      });
                    }
                  }}
                />
              ) : (
                <>
                  <DisabledOverlay show={!extensionEnabled} />
                  <AvailabilityModifier
                    activeModifiers={activeModifiers}
                    className="mb-10 px-4"
                    dimensionsFromStorage={dimensionsFromStorage}
                    setActiveModifiers={setActiveModifiers}
                    skylarkCreds={creds}
                  />
                  <Settings
                    enabledOnSkylarkUI={enabledOnSkylarkUI}
                    toggleEnabledOnSkylarkUI={() =>
                      setEnabledOnSkylarkUI(!enabledOnSkylarkUI)
                    }
                  />
                </>
              )}
            </>
          )}
        </main>
        <Footer
          isHeadersUpdating={
            extensionEnabled &&
            (isHeadersUpdating || activeModifiers !== debouncedActiveModifiers)
          }
        />
      </div>
    </QueryClientProvider>
  );
};

export default App;
