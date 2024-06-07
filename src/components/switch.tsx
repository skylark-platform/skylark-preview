import { Switch as HeadlessUiSwitch } from "@headlessui/react";
import clsx from "clsx";

interface SwitchProps {
  active: boolean;
  disabled?: boolean;
  small?: boolean;
  grayscale?: boolean;
  toggleEnabled: () => void;
  screenReaderDesc: string;
}

export const Switch = ({
  active,
  disabled,
  small,
  grayscale,
  toggleEnabled,
  screenReaderDesc,
}: SwitchProps) => (
  <HeadlessUiSwitch
    checked={active && !disabled}
    className={clsx(
      "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 disabled:bg-manatee-500",
      small ? "h-4 w-7" : "h-6 w-10",
      active ? "bg-brand-primary" : grayscale ? "bg-manatee-300" : "bg-error",
    )}
    disabled={disabled}
    onChange={toggleEnabled}
  >
    <span className="sr-only">{screenReaderDesc}</span>
    <span
      aria-hidden="true"
      className={clsx(
        "pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
        small ? "h-3 w-3" : "h-5 w-5",
        active && !disabled
          ? small
            ? "translate-x-3"
            : "translate-x-4"
          : "translate-x-0",
      )}
    />
  </HeadlessUiSwitch>
);

export const SwitchWithLabel = ({
  label,
  ...props
}: SwitchProps & { label: string }) => (
  <HeadlessUiSwitch.Group>
    <Switch {...props} />
    {label && (
      <HeadlessUiSwitch.Label
        className={clsx(
          "transition-opacity",
          props.active ? "opacity-100" : "opacity-60",
        )}
      >
        {label}
      </HeadlessUiSwitch.Label>
    )}
  </HeadlessUiSwitch.Group>
);
