"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)]/10 flex items-center justify-center border border-[var(--color-primary-dim)]/20">
              <Icon className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
          )}
          <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-[var(--color-on-surface-variant)] text-sm lg:text-base max-w-2xl pl-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
