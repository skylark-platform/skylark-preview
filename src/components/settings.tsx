import clsx from "clsx";
import { Switch } from "./switch";

interface SettingsProps {
  enabledOnSkylarkUI: boolean;
  toggleEnabledOnSkylarkUI: () => void;
}

export const Settings = ({
  enabledOnSkylarkUI,
  toggleEnabledOnSkylarkUI,
}: SettingsProps) => {
  return (
    <div className="mb-2 flex items-center space-x-2 px-4">
      <Switch
        active={enabledOnSkylarkUI}
        toggleEnabled={toggleEnabledOnSkylarkUI}
        screenReaderDesc="Toggle the extension running on Skylark UI"
        small
        grayscale
      />
      <p
        className={clsx(
          "transition-opacity",
          enabledOnSkylarkUI ? "opacity-100" : "opacity-60"
        )}
      >
        {`Intercept requests on the Skylark App UI`}
        <a
          href="https://app.skylarkplatform.com"
          target="_blank"
          className="ml-1 text-brand-primary"
        >{`(app.skylarkplatform.com)`}</a>
      </p>
    </div>
  );
};
