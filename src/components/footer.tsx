import { MdRefresh } from "react-icons/md";
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
  <footer className="relative flex w-full items-center justify-start bg-manatee-200 px-4 py-4 text-xs">
    <Button
      className="mr-4"
      disabled={isHeadersUpdating}
      onClick={refreshTab}
    >{`Refresh`}</Button>
    {/* <p>{`Rules are updated automatically, you may need to refresh to see the changes.`}</p> */}
    {isHeadersUpdating && (
      <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-manatee-200 px-8 text-brand-primary">
        <p>{`Updating Rules`}</p>
        <MdRefresh className="ml-2 h-5 w-5 animate-spin" />
      </div>
    )}
  </footer>
);
