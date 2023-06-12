import clsx from "clsx";
import { SkylarkLogo } from "./skylarkBranding";
import { Switch } from "./switch";
import { Button } from "./button";

interface HeaderProps {
  enabled: boolean;
  credentialsAdded: boolean;
  toggleEnabled: () => void;
  onChangeCredentials: () => void;
}

export const Header = ({
  enabled,
  credentialsAdded,
  toggleEnabled,
  onChangeCredentials,
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
      <h1 className="font-heading text-xl font-bold">{`Foresight`}</h1>
    </div>
    <div className="font-body flex items-center text-xs">
      {credentialsAdded && (
        <p
          className={clsx(
            "mr-2 text-error transition-all",
            !enabled ? "visible opacity-100" : "invisible opacity-0"
          )}
        >{`Intercepts paused`}</p>
      )}
      <Switch
        disabled={!credentialsAdded}
        enabled={enabled}
        toggleEnabled={toggleEnabled}
      />
      <Button
        className="ml-2"
        onClick={() => onChangeCredentials()}
      >{`Change Credentials`}</Button>
    </div>
  </header>
);
