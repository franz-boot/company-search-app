import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'neon';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
        const Comp = asChild ? React.Fragment : "button";
        const buttonClass = cn(
            // Base
            "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
            {
                // Default – neon purple gradient
                "bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-neon-sm hover:shadow-neon-md hover:scale-[1.02]": variant === "default",
                // Outline – glass border
                "bg-transparent text-slate-300 border border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.1)] hover:border-neon-purple hover:text-white": variant === "outline",
                // Secondary – subtle glass
                "bg-[rgba(168,85,247,0.1)] text-slate-300 border border-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.2)] hover:text-white": variant === "secondary",
                // Ghost
                "text-slate-400 hover:bg-[rgba(168,85,247,0.1)] hover:text-white shadow-none": variant === "ghost",
                // Neon glow
                "bg-gradient-to-r from-neon-purple to-neon-cyan text-white animate-glow-pulse": variant === "neon",
                // Sizes
                "h-11 px-6 py-2": size === "default",
                "h-9 rounded-lg px-4 text-xs": size === "sm",
                "h-12 rounded-xl px-8 text-base": size === "lg",
                "h-11 w-11 p-0": size === "icon",
            },
            className
        );

        if (asChild && React.isValidElement(children)) {
            // Spread all button props (onClick, type, disabled, aria-*, data-*, …) into the
            // child element so that asChild doesn't silently swallow non-className props.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return React.cloneElement(children as React.ReactElement<any>, {
                ...props,
                ref,
                className: cn(buttonClass, (children as React.ReactElement<{ className?: string }>).props.className),
            });
        }

        return (
            <button
                ref={ref}
                className={buttonClass}
                {...props}
            >
                {children}
            </button>
        );
    }
)
Button.displayName = "Button"

export { Button }
