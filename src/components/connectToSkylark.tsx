import { useState } from "react";
import clsx from "clsx";
import { ExtensionStorageKeys } from "../constants";
import { Input } from "./input";
import { Button } from "./button";
import { useConnectedToSkylark } from "../hooks/useConnectedToSkylark";

interface ConnectToSkylarkProps {
  className?: string;
  skylarkCreds: {
    uri: string;
    apiKey: string;
  };
  onUpdate: (creds?: { uri: string; apiKey: string }) => void;
}

export const ConnectToSkylark = ({
  className,
  skylarkCreds: initialCreds,
  onUpdate,
}: ConnectToSkylarkProps) => {
  const [creds, setCreds] = useState<{
    uri: string;
    apiKey: string;
  }>(initialCreds);

  const updateCredentials = async (deleteCredentials?: boolean) => {
    await chrome.storage.sync.set({
      [ExtensionStorageKeys.SkylarkUri]: deleteCredentials ? "" : creds.uri,
    });
    await chrome.storage.session.set({
      [ExtensionStorageKeys.SkylarkApiKey]: deleteCredentials
        ? ""
        : creds.apiKey,
    });
    if (deleteCredentials) {
      setCreds({ uri: "", apiKey: "" });
    }
    onUpdate(deleteCredentials ? undefined : creds);
  };

  const { isConnected, isLoading, invalidUri, invalidToken } =
    useConnectedToSkylark(creds);

  return (
    <div className={clsx("flex h-full w-full flex-col", className)}>
      <h2 className="my-4 font-heading text-lg font-bold">{`Enter your Skylark credentials`}</h2>
      <Input
        className="my-4"
        label="API URL"
        name="skylark-api-url"
        type={"string"}
        value={creds.uri}
        onChange={(uri) => setCreds({ ...creds, uri })}
      />
      <Input
        label="API Key"
        name="skylark-api-key"
        type={"string"}
        value={creds.apiKey}
        onChange={(apiKey) => setCreds({ ...creds, apiKey })}
      />
      <div className="flex items-center justify-between">
        <div className="flex h-full items-center">
          {(!isConnected || invalidUri || invalidToken) && (
            <p className="text-error">Invalid Credentials</p>
          )}
        </div>
        <div className="mt-4 flex items-center">
          <button
            onClick={() => {
              void updateCredentials(true);
            }}
          >{`Clear`}</button>
          <Button
            className="ml-4"
            disabled={!creds.apiKey || !creds.uri || !isConnected}
            success
            onClick={() => {
              void updateCredentials();
            }}
            loading={isLoading}
          >
            {isLoading ? `Verifying...` : `Connect`}
          </Button>
        </div>
      </div>
    </div>
  );
};
