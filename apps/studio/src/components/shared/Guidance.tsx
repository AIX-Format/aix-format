"use client";

import React from "react";
import { Info } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const InfoTooltip = ({ content, className }: { content: string; className?: string }) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button className={cn("inline-flex items-center text-foreground/40 hover:text-primary transition-colors cursor-help", className)}>
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={5}
            className="z-[100] max-w-[280px] rounded-xl bg-[#1a1a24] border border-white/10 p-3 text-[11px] text-white/80 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#1a1a24]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
