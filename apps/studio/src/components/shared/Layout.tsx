"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

export const Container = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props}>
    {children}
  </div>
);

interface SectionProps extends HTMLMotionProps<"section"> {
  background?: "dark" | "surface-1" | "surface-2";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Section = ({ 
  className, 
  background = "dark", 
  padding = "md", 
  children, 
  ...props 
}: SectionProps) => {
  const backgrounds = {
    dark: "bg-background",
    "surface-1": "bg-surface-1",
    "surface-2": "bg-surface-2",
  };

  const paddings = {
    none: "py-0",
    sm: "py-12 sm:py-16",
    md: "py-20 sm:py-24",
    lg: "py-32 sm:py-40",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(backgrounds[background], paddings[padding], className)}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export const SectionHeader = ({ 
  title, 
  subtitle, 
  alignment = "center", 
  className 
}: { 
  title: string; 
  subtitle?: string; 
  alignment?: "left" | "center"; 
  className?: string;
}) => (
  <div className={cn(
    "mb-12 sm:mb-16",
    alignment === "center" ? "text-center" : "text-left",
    className
  )}>
    <Typography variant="h2" gradient className="mb-4">
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body" className={cn("max-w-2xl", alignment === "center" && "mx-auto")}>
        {subtitle}
      </Typography>
    )}
  </div>
);
