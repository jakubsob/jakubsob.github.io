"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const Logo = ({ className }: { className?: string }) => (
  <svg width="164" height="168" viewBox="0 0 164 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M152 55.5V26C152 19.3726 146.627 14 140 14H24C17.3726 14 12 19.3726 12 26V49V72C12 78.6274 17.3726 84 24 84H65M127.5 84H140C146.627 84 152 89.3726 152 96V142C152 148.627 146.627 154 140 154H24C17.3726 154 12 148.627 12 142V112" stroke-width="12" stroke-linecap="round" />
    <path d="M34 114C34 114 33.9469 117.576 38 122.5C42.0532 127.424 49 130 56 130C63 130 66 126 69.5 122.5C73 119 127.839 41.1541 130.006 38" stroke-width="12" stroke-linecap="round" />
  </svg>
);

type MenuItemType = {
  title: string;
  href?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  items?: { title: string; href: string; description: string; icon?: React.ReactNode }[];
};

const menuItems: MenuItemType[] = [
  {
    title: "Jakub Sobolewski",
    href: "/",
    icon: <Logo className="inline-block size-[1em] mr-2 stroke-current" />,
    description: "Go to homepage",
    className: "uppercase",
  },
  {
    title: "blog",
    href: "/blog/",
    className: "uppercase",
  },
  {
    title: "resources",
    className: "uppercase",
    items: [
      {
        title: "Learning resources",
        href: "/resources/",
        description: "Browse what helped me become a better engineer.",
      },
      {
        title: "Dashboard Templates",
        href: "/dashboard-templates/",
        description: "Beautiful Shiny dashboard templates ready to use for your applications.",
      },
      {
        title: "Advance Your R Testing Roadmap",
        href: "/get-roadmap/",
        description: "Step-by-step guide to building better tests for R developers.",
      },
    ]
  },
  {
    title: "course",
    href: "/course/",
    className: "text-destructive uppercase",
  },
]

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setOpenDropdown(null) // Close any open dropdowns when toggling mobile menu
  }

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item, index) => (
              <NavigationMenuItem key={index}>
                {item.items ? (
                  // Dropdown menu
                  <>
                    <NavigationMenuTrigger
                      className={cn(navigationMenuTriggerStyle(), item.className)}>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                        {item.items.map((subItem) => (
                          <ListItem
                            key={subItem.title}
                            title={subItem.title}
                            href={subItem.href}
                          >
                            {subItem.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  // Regular link
                  <NavigationMenuLink asChild>
                    <a
                      href={item.href}
                      className={cn(navigationMenuTriggerStyle(), item.className)}
                      >
                        {item?.icon}
                        {item.title}
                    </a>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:text-primary transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full bg-background/95 backdrop-blur-sm border-b shadow-lg">
            <nav className="container mx-auto px-4 py-4">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {item.items ? (
                      // Mobile dropdown
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.title)}
                          className="flex items-center justify-between w-full p-3 text-left rounded-md hover:bg-muted transition-colors"
                        >
                          <span className={cn("", item.className)}>
                            {item.title}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              openDropdown === item.title && "rotate-180"
                            )}
                          />
                        </button>
                        {openDropdown === item.title && (
                          <ul className="mt-2 ml-4 space-y-1">
                            {item.items.map((subItem) => (
                              <li key={subItem.title}>
                                <a
                                  href={subItem.href}
                                  className="block p-2 text-sm rounded-md hover:bg-muted transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <div className="">{subItem.title}</div>
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {subItem.description}
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      // Mobile regular link
                      <a
                        href={item.href}
                        className={cn(
                          "block p-3 rounded-md hover:bg-muted transition-colors",
                          item.className
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                          {item?.icon}
                        {item.title}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors group hover:text-primary",
            className
          )}
          {...props}
        >
          <div className="text-sm leading-none text-foreground group-hover:text-current">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-current">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
