import * as React from "react";
import { cn } from "@/lib/utils.js";

export const Avatar = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted", className)}
    {...props}
  />
);

export const AvatarImage = ({ className, ...props }: React.ComponentProps<"img">) => (
  <img className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
);

export const AvatarFallback = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground", className)}
    {...props}
  />
);
