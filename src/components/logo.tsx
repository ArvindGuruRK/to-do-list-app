import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LayoutGrid className="h-8 w-8 text-primary" />
      <h2 className="text-2xl font-bold text-foreground">Arvind's tasks</h2>
    </div>
  );
}
