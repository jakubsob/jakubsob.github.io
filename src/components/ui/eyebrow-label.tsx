import * as React from "react"
import { cn } from "@/lib/utils"

export interface EyebrowLabelProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const EyebrowLabel = React.forwardRef<HTMLParagraphElement, EyebrowLabelProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3",
        className
      )}
      {...props}
    />
  )
)
EyebrowLabel.displayName = "EyebrowLabel"

export { EyebrowLabel }
