import { useEffect, useState } from "react";
import { SkylarkLogo } from "./skylarkBranding";

export const PreviewStatus = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <>
      {show && (
        <div className="group">
          <div className="fixed bottom-10 left-1/2 z-[9999999999] flex -translate-x-1/2 items-center justify-center rounded-full bg-manatee-200 px-4 py-2 font-heading text-sm text-black shadow shadow-brand-primary md:px-6 md:py-4">
            <SkylarkLogo className="h-6 w-6 md:h-8 md:w-8" />
            <div className="flex h-8 w-0 items-center overflow-hidden transition-all group-hover:w-[260px] md:group-hover:w-[300px]">
              <p className="w-full whitespace-pre text-right font-sans text-xs font-semibold md:text-sm">
                Preview is intercepting requests to Skylark
              </p>
            </div>
          </div>
          <div className="fixed bottom-2 left-1/2 z-[9999999999] hidden -translate-x-1/2 flex-row items-center justify-center gap-4 group-hover:flex">
            <button className="mt-4 rounded bg-manatee-200 bg-opacity-60 p-1 px-2 font-sans text-xs font-semibold text-manatee-800 underline opacity-0 transition-all hover:bg-opacity-100 hover:text-brand-primary group-hover:opacity-100">
              Hide
            </button>
            <button className="mt-4 rounded bg-manatee-200 bg-opacity-60 p-1 px-2 font-sans text-xs font-semibold text-manatee-800 underline opacity-0 transition-all hover:bg-opacity-100 hover:text-brand-primary group-hover:opacity-100">
              Pause
            </button>
          </div>
        </div>
      )}
    </>
  );
};
