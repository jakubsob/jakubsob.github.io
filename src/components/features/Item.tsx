import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const itemVariants = cva(
  "bg-card border border-border rounded-[var(--radius-surface)] transition-all duration-300 group-hover/card:shadow-md group-hover/card:-translate-y-0.5",
  {
    variants: {
      variant: {
        featured: "p-8",
        card: "p-4",
      },
    },
    defaultVariants: { variant: "card" },
  }
);

const titleVariants = cva(
  "transition-colors group-hover/card:text-muted-foreground flex items-center gap-2",
  {
    variants: {
      variant: {
        featured: "text-2xl leading-snug mb-3",
        card: "font-medium mb-2",
      },
    },
    defaultVariants: { variant: "card" },
  },
);

const descriptionVariants = cva("text-muted-foreground", {
  variants: {
    variant: {
      featured: "text-base leading-relaxed mb-6",
      card: "text-sm mb-4",
    },
  },
  defaultVariants: { variant: "card" },
});

interface ItemProps extends VariantProps<typeof itemVariants> {
  href: string;
  title: React.ReactNode;
  description: string;
  meta: React.ReactNode;
  external?: boolean;
  className?: string;
  cardClassName?: string;
}

export function Item({
  href,
  title,
  description,
  meta,
  variant,
  external,
  className,
  cardClassName,
}: ItemProps) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a href={href} {...linkProps} className={cn("group/card", className)}>
      <div className={cn(itemVariants({ variant }), cardClassName)}>
        <h2 className={titleVariants({ variant })}>{title}</h2>
        <p className={descriptionVariants({ variant })}>{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          {meta}
        </div>
      </div>
    </a>
  );
}
