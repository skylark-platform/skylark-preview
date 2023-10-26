import { FiRefreshCw } from "react-icons/fi";
import { sendExtensionMessage } from "../lib/utils";
import { ExtensionMessageType } from "../interfaces";
import { Button } from "./button";

interface FooterProps {
  isHeadersUpdating?: boolean;
}

const refreshTab = () => {
  void sendExtensionMessage({
    type: ExtensionMessageType.RefreshTab,
  });
};

export const Footer = ({ isHeadersUpdating }: FooterProps) => (
  <footer className="relative flex h-14 w-full items-center justify-start bg-manatee-200 px-4 py-4 text-xs">
    <Button
      className="mr-4"
      disabled={isHeadersUpdating}
      onClick={refreshTab}
    >{`Refresh`}</Button>
    {isHeadersUpdating && (
      <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-manatee-200 px-8 text-brand-primary">
        <p>{`Updating Rules`}</p>
        <FiRefreshCw className="ml-2 h-4 w-4 animate-spin" />
      </div>
    )}
  </footer>
);
