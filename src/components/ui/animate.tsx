import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const animateVariants = cva(
  "",
  {
    variants: {
      variant: {
        default: "intersect-once intersect:motion-opacity-in-0 intersect:motion-translate-y-in-25",
        header: "motion-preset-slide-up-lg md:motion-duration-1000",
        fadeIn: "motion-preset-fade-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AnimateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animateVariants> {
  asChild?: boolean
  delay?: number | string
}

const Animate = React.forwardRef<HTMLDivElement, AnimateProps>(
  ({ variant, delay, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cn(
          animateVariants({ variant }),
          delay !== undefined && `motion-delay-${delay}`
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Animate.displayName = "Animate"

export { Animate, animateVariants }
