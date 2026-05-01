"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  elevation?: 1 | 2 | 3;
}

export const Card = ({ className, elevation = 1, ...props }: CardProps) => {
  const elevations = {
    1: "bg-surface-1 border-white/5",
    2: "bg-surface-2 border-white/10",
    3: "bg-surface-3 border-white/15",
  };

  return (
    <motion.div
      whileHover={{ translateY: -4, shadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      className={cn(
        "rounded-xl border p-6 transition-all duration-300",
        elevations[elevation],
        className
      )}
      {...props}
    />
  );
};
