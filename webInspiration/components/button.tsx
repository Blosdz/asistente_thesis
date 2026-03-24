import * as React from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost" | "link" | "outline"
type Size = "md" | "sm"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ")
}

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  danger: "btn btn-danger",
  ghost: "btn btn-secondary bg-white/0 border-transparent hover:bg-white/60",
  link: "px-0 py-0 rounded-none text-sky-700 hover:text-sky-800 font-semibold",

  // ✅ NUEVO: outline (estilo ligero, consistente con tu sistema actual)
  outline: "btn btn-secondary bg-white/70 hover:bg-white border border-slate-200 text-slate-900",
}

const sizeClass: Record<Size, string> = {
  md: "",
  sm: "btn-mini",
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    const base = variant === "link" ? variantClass.link : cn(variantClass[variant], sizeClass[size])
    return <button ref={ref} className={cn(base, className)} {...props} />
  }
)

Button.displayName = "Button"
