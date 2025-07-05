import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Mail } from "lucide-react"

const subscribeButtonVariants = cva(
  "flex items-center",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "gap-0",
        sm: "gap-0 text-sm",
        lg: "gap-0 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SubscribeButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof subscribeButtonVariants> {
  action?: string;
  placeholder?: string;
  buttonText?: string;
}

const SubscribeButton = React.forwardRef<HTMLDivElement, SubscribeButtonProps>(
  ({
    className,
    variant,
    size,
    action = "https://api.follow.it/subscription-form/ZXExLzNLWHB1MC9VVkZKSjZXNlN4QzJ0V3RwRnk3bUUwWGtFSHFEUXVUbDBPQ3pnVi9lUmg1cFo1Y3M0cGd1dHRpbmppcXJ2eHFGaUZJb0ZmT2N5ZXV4dm9vb3hYWmE3RWNnZVAxeU9tNzJEQjYyd1NMeEUzRUU2b201Y2VDNUt8Z3pqdXUvUEEzRUduNGJBa0UrZHZCUVFySjdkdVZaVzZLRXRwZkl4WUFTTT0=/8",
    placeholder = "Enter your email",
    buttonText = "Subscribe",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <form action={action} method="post">
          <div className={cn(subscribeButtonVariants({ variant, size, className }))}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                name="email"
                required
                placeholder={placeholder}
                spellCheck="false"
                className="min-w-[200px] pl-10 border-sky-50 bg-sky-50 text-gray-900 rounded-r-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="max-w-[200px] bg-ocean-green-500 border border-ocean-green-500 text-white font-bold uppercase rounded-l-none rounded-r-lg transition-all duration-300 hover:bg-sky-700 hover:border-sky-50 font-mono tracking-wider"
            >
              {buttonText}
            </Button>
          </div>
        </form>
      </div>
    )
  }
)
SubscribeButton.displayName = "SubscribeButton"

export { SubscribeButton, subscribeButtonVariants }
