import { SkylarkLogo } from "./skylarkBranding";
import { useExtensionSettings } from "../hooks/useExtensionSettings";
import { sendExtensionMessage } from "../lib/utils";
import { ExtensionMessageType } from "../interfaces";
import { EXTENSION_SETTINGS_DEFAULTS } from "../constants";

export const PreviewStatus = () => {
  const { settings, isEnabled, updateSettings } = useExtensionSettings();

  const disableExtension = async () => {
    await sendExtensionMessage({
      type: ExtensionMessageType.DisableExtension,
    });
  };

  const hideExtensionStatus = async () => {
    await updateSettings({
      ...(settings || EXTENSION_SETTINGS_DEFAULTS),
      showStatusOverlay: false,
    });
  };

  return (
    <>
      {isEnabled && settings?.showStatusOverlay && (
        <div className="group">
          <div className="fixed left-0 right-0 top-0 z-above-all h-[10px] w-full bg-error"></div>
          <div className="fixed bottom-10 left-1/2 z-above-all flex -translate-x-1/2 items-center justify-center rounded-full bg-manatee-200 p-3 font-heading text-base text-black shadow shadow-brand-primary group-hover:px-5 md:p-4 md:group-hover:px-8">
            <SkylarkLogo className="h-6 w-6 md:h-8 md:w-8" />
            <div className="flex h-6 w-0 items-center overflow-hidden transition-all group-hover:w-[165px] md:h-8 md:group-hover:w-[190px]">
              <p className="ml-2 w-full whitespace-pre text-left font-sans text-sm font-semibold md:text-base">
                Skylark Preview is enabled
              </p>
            </div>
          </div>
          <div className="fixed bottom-2 left-1/2 z-above-all hidden -translate-x-1/2 flex-row items-center justify-center gap-4 group-hover:flex">
            <button
              onClick={hideExtensionStatus}
              className="mt-4 rounded bg-manatee-200 bg-opacity-60 p-1 px-2 font-sans text-sm font-semibold text-manatee-800 underline opacity-0 transition-all hover:bg-opacity-100 hover:text-brand-primary group-hover:opacity-100"
            >
              Hide
            </button>
            <button
              onClick={disableExtension}
              className="mt-4 rounded bg-manatee-200 bg-opacity-60 p-1 px-2 font-sans text-sm font-semibold text-manatee-800 underline opacity-0 transition-all hover:bg-opacity-100 hover:text-brand-primary group-hover:opacity-100"
            >
              Disable
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PreviewStatusLine = () => {
  const { isEnabled, settings } = useExtensionSettings();

  return (
    <>
      {isEnabled && settings?.showStatusOverlay && (
        <div className="fixed left-0 right-0 top-0 z-above-all h-[10px] w-full bg-error"></div>
      )}
    </>
  );
};
