import * as React from "react"

type Tone = "info" | "danger"

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ")
}

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: Tone
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ tone = "info", className, ...props }, ref) => {
  const toneCls = tone === "danger" ? "alert-pro alert-danger" : "alert-pro alert-info"
  return <div ref={ref} role="alert" className={cn(toneCls, className)} {...props} />
})

Alert.displayName = "Alert"

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("leading-relaxed", className)} {...props} />
  )
)

AlertDescription.displayName = "AlertDescription"
