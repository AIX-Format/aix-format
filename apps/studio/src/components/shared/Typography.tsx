"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "caption" | "code";
  weight?: "regular" | "medium" | "semibold" | "bold";
  gradient?: boolean;
}

export const Typography = ({ 
  variant = "body", 
  weight, 
  gradient, 
  className, 
  children, 
  ...props 
}: TypographyProps) => {
  const tags: Record<string, keyof JSX.IntrinsicElements> = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
    caption: "span",
    code: "code",
  };

  const Tag = tags[variant];

  const variants = {
    h1: "text-[clamp(2.5rem,8vw,5rem)] leading-[1.1] font-bold tracking-tight",
    h2: "text-[clamp(2rem,6vw,3.5rem)] leading-[1.2] font-bold tracking-tight",
    h3: "text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.3] font-bold",
    h4: "text-xl sm:text-2xl font-semibold",
    h5: "text-lg sm:text-xl font-semibold",
    h6: "text-base sm:text-lg font-medium",
    body: "text-base sm:text-lg text-foreground/80 leading-relaxed",
    caption: "text-xs sm:text-sm text-foreground/60",
    code: "font-mono text-sm bg-surface-2 px-1.5 py-0.5 rounded border border-white/5",
  };

  const weights = {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <Tag
      className={cn(
        variants[variant],
        weight && weights[weight],
        gradient && "bg-gradient-to-r from-primary via-purple-mcp to-primary-accent bg-clip-text text-transparent animate-gradient-x",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
