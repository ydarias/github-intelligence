import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        issue: "border-emerald/30 bg-emerald/10 text-emerald",
        pr: "border-accent/30 bg-accent/10 text-accent",
        open: "border-emerald/30 bg-emerald/10 text-emerald",
        closed: "border-accent/30 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      variant: "issue",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
