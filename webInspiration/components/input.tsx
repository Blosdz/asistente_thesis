import * as React from "react"

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ")
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn("input-pro", className)} {...props} />
  }
)

Input.displayName = "Input"
