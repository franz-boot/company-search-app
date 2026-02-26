import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 shadow-sm active:scale-95",
                    {
                        "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20": variant === "default",
                        "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800 dark:hover:bg-slate-800": variant === "outline",
                        "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700": variant === "secondary",
                        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 shadow-none": variant === "ghost",
                        "h-11 px-6 py-2": size === "default",
                        "h-9 rounded-lg px-4": size === "sm",
                        "h-12 rounded-xl px-8": size === "lg",
                        "h-11 w-11": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
