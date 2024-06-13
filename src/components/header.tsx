import clsx from "clsx";
import { SkylarkLogo } from "./skylarkBranding";
import { Switch } from "./switch";
import { Button } from "./button";
import { PopupTab } from "../interfaces";

interface HeaderProps {
  active: boolean;
  credentialsAdded: boolean;
  tab: PopupTab;
  toggleEnabled: () => void;
  onSettingsClick: () => void;
}

export const Header = ({
  active,
  credentialsAdded,
  toggleEnabled,
  onSettingsClick,
}: HeaderProps) => (
  <header className="flex h-16 w-full items-center justify-between bg-nav-bar px-4">
    <div className="flex items-center space-x-4">
      <a
        className=""
        href="https://app.skylarkplatform.com"
        rel="noreferrer"
        target="_blank"
      >
        <SkylarkLogo className="w-8" />
      </a>
      <h1 className="font-heading text-2xl font-bold">{`Skylark Preview`}</h1>
    </div>
    <div className="font-body flex items-center text-sm">
      {credentialsAdded && (
        <p
          className={clsx(
            "mr-2 text-error transition-all",
            !active ? "visible opacity-100" : "invisible opacity-0",
          )}
        >{`Intercepts paused`}</p>
      )}
      <Switch
        disabled={!credentialsAdded}
        active={active}
        screenReaderDesc={`Toggle extension enabled`}
        toggleEnabled={toggleEnabled}
      />
      <Button className="ml-2" onClick={() => onSettingsClick()}>
        {`Change Account`}
      </Button>
    </div>
  </header>
);
