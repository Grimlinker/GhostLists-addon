import * as RadixTooltip from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={300}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={5}
            className="z-50 rounded-xl px-3 py-1 text-sm shadow-md backdrop-blur border border-white/20 bg-pink-100/60 text-purple-700"
          >
            {content}
            <RadixTooltip.Arrow className="fill-pink-100/60" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
