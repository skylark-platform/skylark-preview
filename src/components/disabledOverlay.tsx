import clsx from "clsx";

export const DisabledOverlay = ({ show }: { show: boolean }) => (
  <div
    className={clsx(
      "absolute inset-0 z-40 bg-black/70",
      show ? "visible cursor-not-allowed opacity-100" : "invisible opacity-0",
    )}
  />
);
