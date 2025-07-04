import { cn } from "@/lib/utils";
import Link from "next/link";

import { Button } from "./button";

export function GradientButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        "not-disabled:bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 px-8 rounded-xl font-semibold not-disabled:shadow-lg not-disabled:shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 disabled:bg-gray-700 disabledhover:bg-gray-600 disabled:text-gray-300",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function GradientLink({
  children,
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof Link> & { disabled?: boolean }) {
  return (
    <Link
      {...props}
      href={disabled ? "" : props.href}
      className={cn(
        "flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 px-4 rounded-xl font-semibold not-disabled:shadow-lg not-disabled:shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40",
        {
          "bg-gray-700 disabledhover:bg-gray-600 text-gray-300 shadow-transparent shadow-none!":
            disabled,
        },
        className,
      )}
    >
      {children}
    </Link>
  );
}
