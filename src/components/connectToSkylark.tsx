import { useEffect, useState } from "react";
import clsx from "clsx";
import { Input } from "./input";
import { Button } from "./button";
import {
  REQUIRED_PERMISSIONS,
  useConnectedToSkylark,
} from "../hooks/useConnectedToSkylark";
import { useQueryClient } from "@tanstack/react-query";
import { SkylarkCredentials, SkylarkUserPermission } from "../interfaces";
import {
  getTempCredentialsFromStorage,
  setCredentialsToStorage,
} from "../lib/storage";
import { FiCheck, FiX } from "react-icons/fi";
import { Tooltip } from "./tooltip";

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

  console.log({ creds, initialCreds });

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
    tokenHasCorrectPermissions,
    user,
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

  const permissionsInfo: {
    text: string;
    enabled: boolean;
    requiredPermissions: SkylarkUserPermission[];
  }[] = [
    {
      text: "Can overwrite dimensions",
      enabled: user.canRead,
      requiredPermissions: ["READ"],
    },
    {
      text: "Can time travel to view future availability rules",
      enabled: user.canTimeTravel,
      requiredPermissions: ["READ", "TIME_TRAVEL"],
    },
    {
      text: "Can fetch draft versions",
      enabled: user.canReadDrafts,
      requiredPermissions: ["READ", "WRITE", "IGNORE_AVAILABILITY"],
    },
    {
      text: "Can ignore availability rules",
      enabled: user.canIgnoreAvailability,
      requiredPermissions: ["READ", "IGNORE_AVAILABILITY"],
    },
  ];

  const requiredPermissionsInfo = permissionsInfo.filter(
    ({ requiredPermissions }) =>
      requiredPermissions.every((perm) => REQUIRED_PERMISSIONS.includes(perm)),
  );
  const optionalPermissionsInfo = permissionsInfo.filter(
    ({ requiredPermissions }) =>
      !requiredPermissions.every((perm) => REQUIRED_PERMISSIONS.includes(perm)),
  );

  const sections = [
    { title: "Required", info: requiredPermissionsInfo },
    { title: "Optional", info: optionalPermissionsInfo },
  ];

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
      <div className="flex items-start justify-between">
        <div className="mt-4 flex h-full flex-col items-start justify-center">
          {(!isConnected || invalidUri || invalidToken || !creds?.apiKey) && (
            <p className="text-error">Invalid Credentials</p>
          )}
          {isConnected && user && user.permissions && (
            <>
              <p className="font-bold">
                API Key permissions for{" "}
                <span className="capitalize">{`${user.role?.replace(/_/g, " ").toLocaleLowerCase()}`}</span>
              </p>
              {/* Green tick / Red cross depending on whether its enabled. Tool tip to say what permission you need */}
              {/* Red asterisk to denote required permissions */}
              {sections.map(({ title, info }) => (
                <div>
                  <p className="mt-4 font-medium">{title}:</p>
                  <ul className="mt-1">
                    {info.map(({ text, enabled, requiredPermissions }) => (
                      <li key={text} className="flex h-6 items-center text-xs">
                        {enabled ? (
                          <FiCheck className="text-lg text-success" />
                        ) : (
                          <FiX className="text-xl text-error" />
                        )}
                        <span className="mx-1">{text}</span>
                        <Tooltip
                          tooltip={
                            <>
                              <p className="font-bold">
                                {`Requires permissions: ${requiredPermissions.join(", ")}.`}
                              </p>
                              {enabled ? (
                                <p>You can use this feature.</p>
                              ) : (
                                <p className="text-error}">{`You require additional permissions to use this feature: ${requiredPermissions.filter((perm) => !user.permissions?.includes(perm)).join(", ")}.`}</p>
                              )}
                            </>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
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
              isValidatingCredentials ||
              !tokenHasCorrectPermissions
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
