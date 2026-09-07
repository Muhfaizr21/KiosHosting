import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
    const variants = {
      default: "bg-cyan-500 text-ink-950 font-semibold hover:bg-cyan-400 active:scale-[0.98] shadow-sm shadow-cyan-500/20",
      outline: "border border-slate-700/80 bg-ink-900/60 text-slate-200 hover:bg-ink-800 hover:text-white hover:border-slate-600 active:scale-[0.98]",
      ghost: "text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]",
      link: "text-cyan-400 underline-offset-4 hover:underline",
      secondary: "bg-ink-800 text-slate-200 hover:bg-ink-700 active:scale-[0.98]",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-lg px-6 text-sm font-medium",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
