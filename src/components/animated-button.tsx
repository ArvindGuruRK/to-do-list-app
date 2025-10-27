
"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-md border-2 border-primary p-4 px-6 py-3 font-medium text-primary shadow-md transition duration-300 ease-out",
        className
      )}
      {...props}
    >
      <span className="ease absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center bg-primary text-primary-foreground duration-300 group-hover:translate-x-0">
        <Plus className="h-6 w-6" />
      </span>
      <span className="ease absolute flex h-full w-full transform items-center justify-center text-primary transition-all duration-300 group-hover:translate-x-full">
        {children}
      </span>
      <span className="relative invisible">{children}</span>
    </motion.button>
  );
});

AnimatedButton.displayName = "AnimatedButton";
