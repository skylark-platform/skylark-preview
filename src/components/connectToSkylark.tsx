import { useEffect, useState } from "react";
import clsx from "clsx";
import { Input } from "./input";
import { Button } from "./button";
import { useConnectedToSkylark } from "../hooks/useConnectedToSkylark";
import { useQueryClient } from "@tanstack/react-query";
import { SkylarkCredentials } from "../interfaces";
import {
  getTempCredentialsFromStorage,
  setCredentialsToStorage,
} from "../lib/storage";

interface ConnectToSkylarkProps {
  variant: "authenticated" | "unauthenticated";
  className?: string;
  skylarkCreds: SkylarkCredentials;
  onUpdate: (creds?: SkylarkCredentials) => void;
}

export const ConnectToSkylark = ({
  variant,
  className,
  skylarkCreds: initialCreds,
  onUpdate,
}: ConnectToSkylarkProps) => {
  const [creds, setCreds] = useState<SkylarkCredentials>(initialCreds);

  const updateCredentials = async (deleteCredentials?: boolean) => {
    const emptyCredentials: SkylarkCredentials = { uri: "", apiKey: "" };
    await setCredentialsToStorage(deleteCredentials ? emptyCredentials : creds);
    if (deleteCredentials) {
      setCreds(emptyCredentials);
    }
    onUpdate(deleteCredentials ? undefined : creds);
    await setCredentialsToStorage({
      ...emptyCredentials,
      useTempStorage: true,
    });
  };

  const {
    isConnected,
    isLoading: isValidatingCredentials,
    invalidUri,
    invalidToken,
  } = useConnectedToSkylark(creds, { withInterval: false });

  const queryClient = useQueryClient();

  const handleChange = (newCreds: Partial<SkylarkCredentials>) => {
    const updatedCreds = {
      ...creds,
      ...newCreds,
    };

    setCreds(updatedCreds);
    void setCredentialsToStorage({
      ...updatedCreds,
      useTempStorage: true,
    });
  };

  const fetchTempCredentialsFromStorage = async () => {
    const tempCredentials = await getTempCredentialsFromStorage();

    setCreds((activeCreds) => ({
      uri: tempCredentials.uri || activeCreds.uri,
      apiKey: tempCredentials.apiKey || activeCreds.apiKey,
    }));
  };

  useEffect(() => {
    void fetchTempCredentialsFromStorage();
  }, []);

  return (
    <div className={clsx("flex w-full flex-col", className)}>
      <h2 className="mb-2 mt-4 font-heading text-lg font-bold">
        {variant === "unauthenticated"
          ? `Enter your Skylark credentials`
          : `Skylark Account`}
      </h2>
      <Input
        className="my-2"
        label="API URL"
        name="skylark-api-url"
        type={"string"}
        value={creds.uri}
        onChange={(uri) => handleChange({ uri })}
      />
      <Input
        label="API Key"
        name="skylark-api-key"
        type={"string"}
        value={creds.apiKey}
        onChange={(apiKey) => handleChange({ apiKey })}
      />
      <div className="flex items-center justify-between">
        <div className="flex h-full items-center">
          {(!isConnected || invalidUri || invalidToken || !creds?.apiKey) && (
            <p className="text-error">Invalid Credentials</p>
          )}
          {isConnected &&
            creds?.apiKey &&
            !creds?.apiKey?.startsWith("skylark-admin-") && (
              <p className="text-error">
                Extension may not work with a non-admin API key.
              </p>
            )}
        </div>
        <div className="mt-4 flex items-center">
          <button
            onClick={() => {
              void updateCredentials(true);
              queryClient.clear();
            }}
          >
            {variant === "unauthenticated" ? `Clear` : `Disconnect`}
          </button>
          <Button
            className="ml-4"
            disabled={
              !creds.apiKey ||
              !creds.uri ||
              !isConnected ||
              isValidatingCredentials
            }
            success={variant === "unauthenticated"}
            onClick={() => {
              void updateCredentials();
              if (
                creds.apiKey !== initialCreds.apiKey ||
                creds.uri !== initialCreds.uri
              ) {
                queryClient.clear();
              }
            }}
            loading={Boolean(creds.apiKey && isValidatingCredentials)}
          >
            {creds.apiKey && isValidatingCredentials
              ? `Verifying...`
              : variant === "unauthenticated"
              ? `Connect`
              : `Update`}
          </Button>
        </div>
      </div>
    </div>
  );
};
