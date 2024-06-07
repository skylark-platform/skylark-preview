import clsx from "clsx";
import { SwitchWithLabel } from "./switch";
import { ExtensionSettings, SkylarkCredentials } from "../interfaces";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { EXTENSION_SETTINGS_DEFAULTS } from "../constants";
import { useConnectedToSkylark } from "../hooks/useConnectedToSkylark";
import { Tooltip } from "./tooltip";

interface SettingsProps {
  className: string;
  settings: ExtensionSettings;
  skylarkCreds: SkylarkCredentials;
  updateSettings: Dispatch<SetStateAction<ExtensionSettings | null>>;
}

const Link = ({
  text,
  href,
  inline,
  className,
}: {
  text: string;
  href: string;
  inline?: boolean;
  className?: string;
}) => (
  <a
    href={href}
    target="_blank"
    className={clsx(
      "text-brand-primary transition-opacity",
      !inline && "block",
      className,
    )}
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
  disabled,
  link,
}: {
  active: boolean;
  toggleEnabled: () => void;
  screenReaderDesc: string;
  desc: string;
  tooltip?: ReactNode;
  disabled?: boolean;
  link?: { text: string; href: string };
}) => (
  <div className="flex items-center space-x-2">
    <SwitchWithLabel
      active={active}
      toggleEnabled={toggleEnabled}
      screenReaderDesc={screenReaderDesc}
      small
      grayscale
      label={desc}
      disabled={disabled}
    />
    <div className="flex items-center space-x-1">
      {tooltip && <Tooltip tooltip={tooltip} />}
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
  className,
  skylarkCreds,
  settings: {
    enabledOnSkylarkUI,
    sendIgnoreAvailabilityHeader,
    showStatusOverlay,
    sendDraftHeader,
  },
  updateSettings,
}: SettingsProps) => {
  const { user } = useConnectedToSkylark(skylarkCreds, {
    withInterval: false,
  });

  return (
    <div className={className}>
      {/* <h2 className="mb-1 font-heading text-lg font-bold">{`Settings`}</h2> */}
      <SettingToggle
        active={showStatusOverlay}
        toggleEnabled={() =>
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            showStatusOverlay: !showStatusOverlay,
          }))
        }
        desc={`Display extension enabled overlay`}
        screenReaderDesc="Toggles whether or not to show the Skylark logo on the page when the extension is enabled"
        tooltip={
          <>
            <p className="font-bold">
              Show the Skylark logo on the page when Skylark Preview is enabled.
            </p>
            <p>
              When enabled, Skylark Preview will add an overlay onto the page to
              make it easy to identify that it is active and requests are being
              intercepted.
            </p>
          </>
        }
      />
      <SettingToggle
        active={sendDraftHeader}
        disabled={!user.canReadDrafts}
        toggleEnabled={() => {
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            sendDraftHeader: !sendDraftHeader,
          }));
        }}
        desc={`Preview draft content`}
        screenReaderDesc="Toggle retrieving draft versions of objects from Skylark"
        tooltip={
          <>
            <p className="font-bold">
              Enables sending the `x-draft: true` header on every request
              intercepted by Skylark Preview.
            </p>
            <p>
              Skylark always returns the published version of an object's
              metadata. This ensures that all content shown on your production
              apps is meant to be live.
            </p>
            <p>
              However, when using Skylark Preview, you may want to view and
              validate the draft versions before committing to publishing them.
            </p>
            <p>
              Warning: Enabling this puts every request in{" "}
              <Link
                href="https://docs.skylarkplatform.com/docs/ignoring-availability"
                text="Ignore Availability mode"
                inline
              />{" "}
              meaning any Availability rules are ignored and all objects are
              returned.
            </p>
            {!user.canReadDrafts && (
              <p className="font-medium text-error">
                {`Requires \`WRITE\` ${user.canIgnoreAvailability ? "" : "& `IGNORE_AVAILABILITY`"} permissions which you
                do not have.`}
              </p>
            )}
          </>
        }
      />
      <SettingToggle
        active={enabledOnSkylarkUI}
        toggleEnabled={() => {
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            enabledOnSkylarkUI: !enabledOnSkylarkUI,
          }));
        }}
        desc={`Intercept requests on the Skylark app UI`}
        screenReaderDesc="Toggle the extension running on Skylark UI"
        tooltip={
          <>
            <p className="font-bold">
              Disables Skylark Preview intercepting requests when using the
              Skylark UI.
            </p>
            <p>
              By default, Skylark Preview runs on any website and intercepts any
              requests matching your Skylark Account URL.
            </p>
            <p>
              This enables you to filter your whole content library using
              Skylark Preview's Time Travel and Audience Dimensions.
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
        active={sendIgnoreAvailabilityHeader}
        toggleEnabled={() =>
          updateSettings((prev) => ({
            ...(prev || EXTENSION_SETTINGS_DEFAULTS),
            sendIgnoreAvailabilityHeader: !sendIgnoreAvailabilityHeader,
          }))
        }
        disabled={!user.canIgnoreAvailability}
        desc={`Include the Ignore Availability header (Advanced)`}
        screenReaderDesc="Toggle the extension sending the x-ignore-availability header as false"
        tooltip={
          <>
            <p className="font-bold">
              Enables sending the `x-ignore-availability: false` header on every
              request intercepted by Skylark Preview.
            </p>
            <p>
              When enabled, Skylark Preview will force availability to be
              ignored for all of your queries. It does this to ensure the Time
              Travel and Audience Dimensions you have selected reflect on your
              app.
            </p>
            <p>
              However, if your app has queries that utilise ignore availability,
              you may want to disable sending this header.
            </p>
            {!user.canIgnoreAvailability && (
              <p className="font-medium text-error">
                Requires `IGNORE_AVAILABILITY` permission which you do not have.
              </p>
            )}
            <Link
              href="https://docs.skylarkplatform.com/docs/ignoring-availability"
              text="Documentation"
            />
          </>
        }
      />
    </div>
  );
};
