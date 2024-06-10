import { useEffect } from "react";
import clsx from "clsx";
import { useAvailabilityDimensionsWithValues } from "../hooks/useAvailabilityDimensionsValues";
import {
  ExtensionMessageValueHeaders,
  ParsedSkylarkDimensionsWithValues,
  SkylarkCredentials,
} from "../interfaces";
import { DimensionCombobox } from "./dimensionCombobox";
import { Input } from "./input";
import { setParsedDimensionsToStorage } from "../lib/storage";
import { LanguageCombobox } from "./languageCombobox";
import { useConnectedToSkylark } from "../hooks/useConnectedToSkylark";

interface AvailabilityModifierProps {
  className: string;
  skylarkCreds: SkylarkCredentials;
  activeModifiers: ExtensionMessageValueHeaders;
  disabled?: boolean;
  dimensionsFromStorage?: ParsedSkylarkDimensionsWithValues[] | undefined;
  setActiveModifiers: (m: ExtensionMessageValueHeaders) => void;
}

const headerClassName = "font-heading text-lg font-bold";

export const AvailabilityModifier = ({
  className,
  skylarkCreds,
  activeModifiers,
  dimensionsFromStorage,
  setActiveModifiers,
}: AvailabilityModifierProps) => {
  const { dimensions: dimensionsFromServer, isDimensionsValuesLoading } =
    useAvailabilityDimensionsWithValues(skylarkCreds.uri, skylarkCreds.apiKey);

  const { account, user } = useConnectedToSkylark(skylarkCreds, {
    withInterval: false,
  });

  useEffect(() => {
    if (!isDimensionsValuesLoading) {
      void setParsedDimensionsToStorage(dimensionsFromServer || []);
    }
  }, [isDimensionsValuesLoading, dimensionsFromServer]);

  const dimensions =
    isDimensionsValuesLoading && dimensionsFromStorage
      ? dimensionsFromStorage
      : dimensionsFromServer;

  return (
    <div className={clsx("relative h-full w-full", className)}>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="">
          <h2 className={clsx(headerClassName, "mb-4")}>{`Time Window`}</h2>
          <Input
            label="Time Travel"
            name="time-travel"
            type={"datetime-local"}
            disabled={!user.canTimeTravel}
            value={activeModifiers.timeTravel}
            onChange={(timeTravel) =>
              setActiveModifiers({
                ...activeModifiers,
                timeTravel,
              })
            }
          />
        </div>
        <div>
          <h2 className={clsx(headerClassName, "mb-4")}>{`Language`}</h2>
          <LanguageCombobox
            selectedValue={activeModifiers.language}
            additionalOptions={
              account?.config.default_language
                ? [
                    {
                      value: account?.config.default_language,
                      label: account?.config.default_language,
                    },
                  ]
                : undefined
            }
            onChange={(opt) =>
              setActiveModifiers({
                ...activeModifiers,
                language: opt?.value || "",
              })
            }
          />
        </div>
      </div>
      <div className="mt-4 text-xs">
        <h2 className={clsx(headerClassName, "mb-1")}>{`Audience`}</h2>
        <div className="grid grid-cols-2 gap-2">
          {isDimensionsValuesLoading &&
            !dimensionsFromStorage &&
            (dimensions || Array.from({ length: 2 })).map((_, i) => (
              <div
                className="mt-2 h-12 w-full animate-pulse rounded-lg bg-gray-300"
                key={`skeleton-${i}`}
              ></div>
            ))}
          {(!isDimensionsValuesLoading || dimensionsFromStorage) &&
            dimensions?.map((dimension) => {
              const options = dimension.values.map(({ slug, title }) => ({
                value: slug,
                label: title || slug,
              }));
              return (
                <div className="my-2 w-full" key={dimension.uid}>
                  <DimensionCombobox
                    key={dimension.uid}
                    label={dimension.title || dimension.slug}
                    options={options}
                    selectedValue={activeModifiers.dimensions[dimension.slug]}
                    onChange={(opt) =>
                      setActiveModifiers({
                        ...activeModifiers,
                        dimensions: {
                          ...activeModifiers.dimensions,
                          [dimension.slug]: opt ? opt.value : "",
                        },
                      })
                    }
                  />
                </div>
              );
            })}
        </div>
        {dimensionsFromServer && dimensionsFromServer.length === 0 && (
          <p className="w-full text-gray-500">
            No Audience Dimensions configured on the connected account.
          </p>
        )}
        {(!isDimensionsValuesLoading || dimensionsFromStorage) &&
          dimensions &&
          dimensions.length > 0 && (
            <p className="my-2 text-gray-500">
              Any unset Audience Dimensions will fall back to the value
              specified in query arguments.
            </p>
          )}
      </div>
    </div>
  );
};
