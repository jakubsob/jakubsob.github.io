import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const codeFrameVariants = cva("rounded-lg", {
  variants: {
    variant: {
      destructive: "text-sm border border-destructive/60",
      success: "text-sm border border-success/60",
      neutral: "text-sm border border-border/60",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface CodeFrameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeFrameVariants> {}

const CodeFrame = React.forwardRef<HTMLDivElement, CodeFrameProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(codeFrameVariants({ variant, className }))}
      {...props}
    />
  )
)
CodeFrame.displayName = "CodeFrame"

export { CodeFrame, codeFrameVariants }
