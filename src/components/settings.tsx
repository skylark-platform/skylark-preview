import clsx from "clsx";
import { SwitchWithLabel } from "./switch";
import { ExtensionSettings } from "../interfaces";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { FiInfo } from "react-icons/fi";
import { EXTENSION_SETTINGS_DEFAULTS } from "../constants";

interface SettingsProps {
  settings: ExtensionSettings;
  updateSettings: Dispatch<SetStateAction<ExtensionSettings | null>>;
}

const Link = ({
  text,
  href,
  className,
}: {
  text: string;
  href: string;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    className={clsx("block text-brand-primary transition-opacity", className)}
  >
    {text}
  </a>
);

const SettingToggle = ({
  active,
  toggleEnabled,
  desc,
  screenReaderDesc,
  tooltip,
  link,
}: {
  active: boolean;
  toggleEnabled: () => void;
  screenReaderDesc: string;
  desc: string;
  tooltip?: ReactNode;
  link?: { text: string; href: string };
}) => (
  <div className="flex items-center space-x-2 px-4">
    <SwitchWithLabel
      active={active}
      toggleEnabled={toggleEnabled}
      screenReaderDesc={screenReaderDesc}
      small
      grayscale
      label={desc}
    />
    <div className="flex items-center space-x-1">
      {tooltip && (
        <div className="group relative py-2 hover:cursor-pointer">
          <FiInfo className="h-3.5 w-3.5 transition-colors group-hover:text-brand-primary" />
          <div className="absolute -left-40 bottom-7 z-50 hidden w-80 space-y-2 rounded-lg bg-white p-4 text-xs shadow-md shadow-gray-400 group-hover:block">
            {tooltip}
          </div>
        </div>
      )}
      {link && (
        <a
          href={link.href}
          target="_blank"
          className={clsx(
            "text-brand-primary",
            "transition-opacity",
            active ? "opacity-100" : "opacity-60",
          )}
        >{`(${link.text})`}</a>
      )}
    </div>
  </div>
);

export const Settings = ({
  settings: {
    enabledOnSkylarkUI,
    sendIgnoreAvailabilityHeader,
    showStatusOverlay,
  },
  updateSettings,
}: SettingsProps) => {
  return (
    <div className="mb-2">
      <SettingToggle
        active={enabledOnSkylarkUI}
        toggleEnabled={() => {
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            enabledOnSkylarkUI: !enabledOnSkylarkUI,
          }));
        }}
        desc={`Intercept requests on the Skylark App UI`}
        screenReaderDesc="Toggle the extension running on Skylark UI"
        tooltip={
          <>
            <p className="font-bold">
              Disables Preview intercepting requests when using the Skylark UI.
            </p>
            <p>
              By default, Preview runs on any website and intercepts any
              requests matching your Skylark Account URL.
            </p>
            <p>
              This enables you to filter your whole content library using
              Preview's Time Travel and Audience Dimensions.
            </p>
            <p>
              However, when making modifications to your content you may want to
              disable this.
            </p>
            <Link href="https://app.skylarkplatform.com" text="Open Skylark" />
          </>
        }
      />
      <SettingToggle
        active={!sendIgnoreAvailabilityHeader}
        toggleEnabled={() =>
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            sendIgnoreAvailabilityHeader: !sendIgnoreAvailabilityHeader,
          }))
        }
        desc={`Disable sending the Ignore Availability header (Advanced)`}
        screenReaderDesc="Toggle the extension sending the x-ignore-availability header as false"
        tooltip={
          <>
            <p className="font-bold">
              Disables sending `x-ignore-availability: false` on every request
              intercepted by Preview.
            </p>
            <p>
              By default, Preview will disable ignoring availability for all of
              your queries. It does this to ensure the Time Travel and Audience
              Dimensions you have selected reflect on your app.
            </p>
            <p>
              However, if your app has queries that utilise ignore availability,
              you may want to disable sending this header.
            </p>
            <Link
              href="https://docs.skylarkplatform.com/docs/ignoring-availability"
              text="Documentation"
            />
          </>
        }
      />
      <SettingToggle
        active={showStatusOverlay}
        toggleEnabled={() =>
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            showStatusOverlay: !showStatusOverlay,
          }))
        }
        desc={`Show extension enabled overlay`}
        screenReaderDesc="Toggles whether or not to show the Skylark logo on the page when the extension is enabled"
        tooltip={
          <>
            <p className="font-bold">
              Show the Skylark logo on the page when Preview is enabled.
            </p>
            <p>
              When enabled, Skylark Preview will add an overlay onto the page so
              that it is easy to identify it is active and requests are being
              intercepted.
            </p>
          </>
        }
      />
    </div>
  );
};
