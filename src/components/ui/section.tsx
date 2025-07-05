import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        light: "bg-white bg-gray-50 px-4 bg-[url('/noise-sky.svg')] bg-repeat",
        dark: "bg-sky-700 px-4",
      },
      size: {
        fit: "h-fit",
        full: "h-screen",
        md: "h-[50vh]",
        lg: "h-[75vh]",
        xl: "h-[90vh]",
      },
    },
    defaultVariants: {
      variant: "light",
      size: "fit",
    },
  }
)

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  asChild?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "section"
    return (
      <Comp
        className={cn(sectionVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Section.displayName = "Section"

export { Section, sectionVariants }
