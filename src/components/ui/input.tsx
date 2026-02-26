import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon, label, id, ...props }, ref) => {
        return (
            <div className="relative flex flex-col w-full gap-1.5">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-xs font-medium text-slate-400 uppercase tracking-wider pl-1"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center w-full group">
                    {icon && (
                        <div className="absolute left-3.5 text-slate-500 group-focus-within:text-neon-purple transition-colors duration-200 z-10">
                            {icon}
                        </div>
                    )}
                    <input
                        id={id}
                        type={type}
                        className={cn(
                            // Base glass input
                            "flex h-11 w-full rounded-xl px-4 py-2 text-sm text-slate-200 transition-all duration-200",
                            "bg-[rgba(15,20,40,0.7)] backdrop-blur-sm",
                            "border border-[rgba(168,85,247,0.2)]",
                            "placeholder:text-slate-600",
                            // Focus
                            "focus-visible:outline-none focus-visible:border-neon-purple focus-visible:ring-2 focus-visible:ring-neon-purple/20 focus-visible:shadow-neon-sm",
                            // Disabled
                            "disabled:cursor-not-allowed disabled:opacity-40",
                            // Icon offset
                            icon && "pl-10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {/* Bottom glow line on focus */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-gradient-to-r from-neon-purple to-neon-cyan group-focus-within:w-[90%] transition-all duration-300 rounded-full" />
                </div>
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
